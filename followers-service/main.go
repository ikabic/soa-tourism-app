package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"saga"

	nats "saga/nats"

	grpcserver "followers-service.xws.com/grpc"
	"followers-service.xws.com/handler"
	"followers-service.xws.com/middleware"
	"followers-service.xws.com/repo"
	"followers-service.xws.com/service"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func initDatabaseDriver() neo4j.DriverWithContext {
	godotenv.Load()
	driver, err := neo4j.NewDriverWithContext(os.Getenv("NEO4J_URI"), neo4j.BasicAuth(os.Getenv("NEO4J_USER"), os.Getenv("NEO4J_PASSWORD"), ""))

	if err != nil {
		log.Fatal(err)
		return nil
	}

	if err := driver.VerifyConnectivity(context.Background()); err != nil {
		log.Fatal("Neo4j connection failed:", err)
	}

	return driver
}

func initNats() (saga.Publisher, saga.Subscriber) {
	publisher, err := nats.NewNATSPublisher(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.reply")
	if err != nil {
		log.Fatal(err)
	}

	subscriber, err := nats.NewNATSSubscriber(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), "block_user.command", "followers")
	if err != nil {
		log.Fatal(err)
	}

	return publisher, subscriber
}

func startServer(followHandler *handler.FollowHandler) {
	router := mux.NewRouter().StrictSlash(true)

	protected := router.PathPrefix("/").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/{userId}/follow", followHandler.Follow).Methods("POST")
	protected.HandleFunc("/{userId}/unfollow", followHandler.Unfollow).Methods("DELETE")
	protected.HandleFunc("/{userId}/can-read", followHandler.CanReadBlog).Methods("GET")

	router.HandleFunc("/{userId}/followers", followHandler.GetFollowers).Methods("GET")
	router.HandleFunc("/{userId}/following", followHandler.GetFollowing).Methods("GET")
	router.HandleFunc("/{userId}/recommendations", followHandler.GetRecommendations).Methods("GET")

	log.Println("Followers server starting on :8082")
	log.Fatal(http.ListenAndServe(":8082", router))
}

func main() {
	driver := initDatabaseDriver()
	if driver == nil {
		log.Fatal("Failed to connect to database")
	}

	followRepo := &repo.FollowRepository{Driver: driver}
	snapshotRepo := &repo.SagaSnapshotRepository{Driver: driver}

	followService := &service.FollowService{Repo: followRepo, SnapshotRepo: snapshotRepo}

	followHandler := &handler.FollowHandler{Service: followService}

	publisher, subscriber := initNats()
	blockUserHandler, _ := handler.NewBlockUserCommandHandler(followService, publisher, subscriber)
	_ = blockUserHandler

	go grpcserver.StartGRPCServer(followRepo)

	startServer(followHandler)
}
