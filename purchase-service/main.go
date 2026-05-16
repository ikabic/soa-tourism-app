package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"saga"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"purchase-service/handler"
	"purchase-service/middleware"
	"purchase-service/model"
	"purchase-service/repo"
	"purchase-service/service"

	nats "saga/nats"
)

func initDatabase() *gorm.DB {
	godotenv.Load()

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	if dbHost == "" {
		dbHost = "localhost"
	}
	if dbPort == "" {
		dbPort = "5432"
	}
	if dbUser == "" {
		dbUser = "postgres"
	}
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	if dbName == "" {
		dbName = "purchase"
	}
	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	connectionURL := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost,
		dbPort,
		dbUser,
		dbPassword,
		dbName,
		dbSSLMode,
	)

	database, err := gorm.Open(postgres.Open(connectionURL), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
		return nil
	}

	database.AutoMigrate(&model.CartItem{}, &model.Purchase{})
	return database
}

func initNats(pubSubject, subSubject, queueGroup string) (saga.Publisher, saga.Subscriber) {
	publisher, err := nats.NewNATSPublisher(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), pubSubject)
	if err != nil {
		log.Fatal(err)
	}

	subscriber, err := nats.NewNATSSubscriber(os.Getenv("NATS_HOST"), os.Getenv("NATS_PORT"), os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD"), subSubject, queueGroup)
	if err != nil {
		log.Fatal(err)
	}

	return publisher, subscriber
}

func main() {
	database := initDatabase()
	if database == nil {
		log.Fatal("Failed to connect to database")
	}

	cartRepo := &repo.CartRepository{DB: database}
	purchaseRepo := &repo.PurchaseRepository{DB: database}
	purchaseService := &service.PurchaseService{
		CartRepo:       cartRepo,
		PurchaseRepo:   purchaseRepo,
		TourServiceURL: os.Getenv("TOUR_SERVICE_URL"),
	}
	purchaseHandler := &handler.PurchaseHandler{Service: purchaseService}

	publisher, subscriber := initNats("block_user.reply", "block_user.command", "purchases")
	blockUserHandler, _ := handler.NewBlockUserCommandHandler(purchaseService, publisher, subscriber)
	_ = blockUserHandler

	router := mux.NewRouter().StrictSlash(true)
	router.Use(middleware.AuthMiddleware)

	router.HandleFunc("/cart", purchaseHandler.GetCart).Methods("GET")
	router.HandleFunc("/cart", purchaseHandler.AddCartItem).Methods("POST")
	router.HandleFunc("/cart/{id}", purchaseHandler.RemoveCartItem).Methods("DELETE")
	router.HandleFunc("/checkout", purchaseHandler.Checkout).Methods("POST")
	router.HandleFunc("/purchases", purchaseHandler.GetPurchases).Methods("GET")
	router.HandleFunc("/status/{tourId}", purchaseHandler.GetPurchaseStatus).Methods("GET")

	log.Println("Purchase service listening on :8083")
	log.Fatal(http.ListenAndServe(":8083", router))
}
