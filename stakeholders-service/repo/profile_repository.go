package repo

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"stakeholders-service.xws.com/model"
)

type ProfileRepository struct {
	DB *gorm.DB
}

func (repo *ProfileRepository) FindByUser(userID uuid.UUID) (*model.Profile, error) {
	var profile model.Profile
	err := repo.DB.Where("user_id = ?", userID).First(&profile).Error
	return &profile, err
}

func (repo *ProfileRepository) Update(profile *model.Profile) error {
	return repo.DB.Save(profile).Error
}
