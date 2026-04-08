package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/repo"
	"os"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type UserService struct {
	Repo *repo.UserRepository
}

func (service *UserService) Register(request dto.RegisterRequest) error {
	_, err := service.Repo.FindByUsername(request.Username)
	if err == nil {
		return errors.New("Username already exists")
	}

	_, err = service.Repo.FindByEmail(request.Email)
	if err == nil {
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
    user, err := service.Repo.FindByUsername(request.Username)
    if err != nil {
        return "", errors.New("Invalid credentials")
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
    if err != nil {
        return "", errors.New("Invalid credentials")
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

