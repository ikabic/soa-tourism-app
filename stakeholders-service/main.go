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

	database.AutoMigrate(&model.User{})
	return database
}

func startServer(handler *handler.UserHandler) {
	router := mux.NewRouter().StrictSlash(true)

	router.HandleFunc("/register", handler.Register).Methods("POST")
	router.HandleFunc("/login", handler.Login).Methods("POST")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))
	println("Server starting")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	database := initDatabase()
	if database == nil {
		log.Fatal("Failed to connect to database")
	}

	repo := &repo.UserRepository{DB: database}
	service := &service.UserService{Repo: repo}
	handler := &handler.UserHandler{Service: service}

	startServer(handler)
}
