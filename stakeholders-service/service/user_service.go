package service

import (
	"errors"

	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/repo"
)

type UserService struct {
	Repo *repo.UserRepository
}

func (service *UserService) Register(request dto.RegisterRequest) error {

	if request.Role == "admin" {
		return errors.New("Cannot register as admin")
	}

	existing := service.Repo.FindByUsername(request.Username)
	if existing.ID != uuid.Nil {
		return errors.New("Username already exists")
	}

	existing = service.Repo.FindByEmail(request.Email)
	if existing.ID != uuid.Nil {
		return errors.New("Email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := model.User{
		Username: request.Username,
		Password: string(hashedPassword),
		Email:    request.Email,
		Role:     model.Role(request.Role),
	}

	return service.Repo.Create(&user)

}

func (service *UserService) Login(request dto.LoginRequest) (string, error) {
	user := service.Repo.FindByUsername(request.Username)
	if user.ID == uuid.Nil {
		return "", errors.New("Invalid credentials")
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		return "", errors.New("Invalid credentials")
	}

	if user.IsBlocked {
		return "", errors.New("User is blocked")
	}

	claims := jwt.MapClaims{
		"userId": user.ID.String(),
		"role":   user.Role,
		"exp":    time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secret := os.Getenv("JWT_SECRET")

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *UserService) GetAllUsers() ([]model.User, error) {
	users, err := s.Repo.GetAllUsers()
	if err != nil {
		return nil, err
	}

	for i := range users {
		users[i].Password = ""
	}

	return users, nil
}

func (s *UserService) BlockUser(userID string) error {
	return s.Repo.BlockUser(userID)
}
