package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"followers-service.xws.com/grpcclient"
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

func startServer(followHandler *handler.FollowHandler) {
	router := mux.NewRouter().StrictSlash(true)

	protected := router.PathPrefix("/").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/{userId}/follow", followHandler.Follow).Methods("POST")
	protected.HandleFunc("/{userId}/unfollow", followHandler.Unfollow).Methods("DELETE")

	router.HandleFunc("/{userId}/followers", followHandler.GetFollowers).Methods("GET")
	router.HandleFunc("/{userId}/following", followHandler.GetFollowing).Methods("GET")

	log.Println("Followers server starting on :8082")
	log.Fatal(http.ListenAndServe(":8082", router))
}

func main() {
	driver := initDatabaseDriver()
	if driver == nil {
		log.Fatal("Failed to connect to database")
	}

	userClient := grpcclient.NewUserClient(os.Getenv("STAKEHOLDERS_GRPC_ADDR"))

	followRepo := &repo.FollowRepository{Driver: driver}
	followService := &service.FollowService{Repo: followRepo, UserClient: userClient}
	followHandler := &handler.FollowHandler{Service: followService}

	startServer(followHandler)
}
