package main

import (
	"fmt"

	"log"
	"os"

	"github.com/joho/godotenv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"stakeholders-service.xws.com/model"
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

func main() {
	database := initDatabase()
	if database == nil {
		log.Fatal("Failed to connect to database")
	}
}
