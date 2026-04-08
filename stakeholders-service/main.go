package main

import (
	"fmt"

	"log"
	"os"

	"github.com/joho/godotenv"

	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"stakeholders-service.xws.com/handler"
	"stakeholders-service.xws.com/middleware"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/repo"
	"stakeholders-service.xws.com/service"
)

func initDatabase() *gorm.DB {
	godotenv.Load()
	connection_url := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_SSLMODE"))
	database, err := gorm.Open(postgres.Open(connection_url), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
		return nil
	}

	database.AutoMigrate(&model.User{}, &model.Profile{})
	return database
}

func startServer(userHandler *handler.UserHandler, profileHandler *handler.ProfileHandler) {
	router := mux.NewRouter().StrictSlash(true)

	router.HandleFunc("/register", userHandler.Register).Methods("POST")
	router.HandleFunc("/login", userHandler.Login).Methods("POST")

	router.Handle("/admin/users", middleware.AuthMiddleware(middleware.AdminOnly(http.HandlerFunc(userHandler.GetAllUsers)))).Methods("GET")
	router.Handle("/admin/users/{id}/block", middleware.AuthMiddleware(middleware.AdminOnly(http.HandlerFunc(userHandler.BlockUser)))).Methods("PUT")

	protected := router.PathPrefix("/profile").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("", profileHandler.GetProfile).Methods("GET")
	protected.HandleFunc("", profileHandler.UpdateProfile).Methods("PUT")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))
	println("Server starting...")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	database := initDatabase()
	if database == nil {
		log.Fatal("Failed to connect to database")
	}

	userRepo := &repo.UserRepository{DB: database}
	profileRepo := &repo.ProfileRepository{DB: database}

	userService := &service.UserService{Repo: userRepo}
	profileService := &service.ProfileService{Repo: profileRepo}

	userHandler := &handler.UserHandler{Service: userService}
	profileHandler := &handler.ProfileHandler{Service: profileService}

	startServer(userHandler, profileHandler)
}
