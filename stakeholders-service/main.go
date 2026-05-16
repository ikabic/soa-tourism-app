package main

import (
	"fmt"
	"path/filepath"
	"saga"

	"log"
	"os"

	"github.com/joho/godotenv"

	"net/http"

	nats "saga/nats"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	grpcclient "stakeholders-service.xws.com/grpc"
	"stakeholders-service.xws.com/handler"
	"stakeholders-service.xws.com/middleware"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/orchestrator"
	"stakeholders-service.xws.com/repo"
	"stakeholders-service.xws.com/service"
)

func initDatabase() *gorm.DB {
	godotenv.Load()

	log.Printf("DB_HOST=%s, DB_USER=%s, DB_NAME=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"))

	connection_url := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	database, err := gorm.Open(postgres.Open(connection_url), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
		return nil
	}

	database.AutoMigrate(&model.User{}, &model.Profile{}, &model.ProfileSnapshot{})
	return database
}

func ensureUploadDirs() {
	os.MkdirAll(filepath.Join("uploads", "avatars"), os.ModePerm)
}

func initOrchestrator() *orchestrator.BlockUserOrchestrator {
	publisher, err := nats.NewNATSPublisher(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.command")
	if err != nil {
		log.Fatal(err)
	}

	subscriber, err := nats.NewNATSSubscriber(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.reply", "stakeholders")
	if err != nil {
		log.Fatal(err)
	}

	orchestrator, err := orchestrator.NewBlockUserOrchestrator(publisher, subscriber)
	if err != nil {
		log.Fatal(err)
	}

	return orchestrator
}

func initNats() (saga.Publisher, saga.Subscriber) {
	publisher, err := nats.NewNATSPublisher(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.reply")
	if err != nil {
		log.Fatal(err)
	}

	subscriber, err := nats.NewNATSSubscriber(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.command", "stakeholders")
	if err != nil {
		log.Fatal(err)
	}

	return publisher, subscriber
}

func startServer(userHandler *handler.UserHandler, profileHandler *handler.ProfileHandler) {
	router := mux.NewRouter().StrictSlash(true)

	router.HandleFunc("/register", userHandler.Register).Methods("POST")
	router.HandleFunc("/login", userHandler.Login).Methods("POST")

	router.Handle("/admin/users", middleware.AuthMiddleware(middleware.AdminOnly(http.HandlerFunc(userHandler.GetAllUsers)))).Methods("GET")
	router.Handle("/admin/users/{id}/block", middleware.AuthMiddleware(middleware.AdminOnly(http.HandlerFunc(userHandler.BlockUser)))).Methods("PUT")

	router.HandleFunc("/profile/{username}", profileHandler.GetProfile).Methods("GET")
	router.HandleFunc("/profiles", profileHandler.GetProfiles).Methods("GET")

	protected := router.PathPrefix("/profile").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("", profileHandler.UpdateProfile).Methods("PUT")

	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))
	println("Server starting...")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	database := initDatabase()
	if database == nil {
		log.Fatal("Failed to connect to database")
	}

	ensureUploadDirs()

	followClient := grpcclient.NewFollowClient(os.Getenv("FOLLOWERS_GRPC_ADDR"))

	userRepo := &repo.UserRepository{DB: database}
	profileRepo := &repo.ProfileRepository{DB: database}
	snapshotRepo := &repo.SagaSnapshotRepository{DB: database}

	orchestrator := initOrchestrator()

	userService := &service.UserService{Repo: userRepo, Orchestrator: orchestrator}
	profileService := &service.ProfileService{Repo: profileRepo, FollowClient: followClient, SnapshotRepo: snapshotRepo}

	userHandler := &handler.UserHandler{Service: userService}
	profileHandler := &handler.ProfileHandler{Service: profileService}

	publisher, subscriber := initNats()
	blockUserHandler, err := handler.NewBlockUserCommandHandler(userService, profileService, publisher, subscriber)
	if err != nil {
		log.Fatal(err)
	}
	_ = blockUserHandler

	go grpcclient.StartGRPCServer(userRepo)

	startServer(userHandler, profileHandler)
}
