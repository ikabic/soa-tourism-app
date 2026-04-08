package repo

import (
	"gorm.io/gorm"
	"stakeholders-service.xws.com/model"
)

type UserRepository struct {
	DB *gorm.DB
}

func (repo *UserRepository) Create(user *model.User) error {
	return repo.DB.Create(user).Error
}

func (repo *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := repo.DB.Where("username = ?", username).Limit(1).Find(&user).Error
	return &user, err
}

func (repo *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := repo.DB.Where("email = ?", email).Limit(1).Find(&user).Error
	return &user, err
}

func (r *UserRepository) GetAllUsers() ([]model.User, error) {
    var users []model.User
    err := r.DB.Find(&users).Error
    return users, err
}

func (r *UserRepository) BlockUser(userID string) error {
    return r.DB.Model(&model.User{}).Where("id = ?", userID).Update("is_blocked", true).Error
}
