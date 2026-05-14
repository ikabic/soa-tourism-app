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

func (repo *ProfileRepository) FindByUsername(username string) (*model.Profile, error) {
	var profile model.Profile
	err := repo.DB.
		Table("profiles").
		Joins("LEFT JOIN users ON users.id = profiles.user_id").
		Where("users.username = ?", username).
		First(&profile).Error
	return &profile, err
}

func (repo *ProfileRepository) GetProfiles(userIDs []uuid.UUID) ([]ProfileDTO, error) {
	var result []ProfileDTO

	err := repo.DB.
		Table("profiles").
		Select("profiles.user_id, profiles.name, profiles.last_name, profiles.avatar, users.username").
		Joins("left join users on users.id = profiles.user_id").
		Where("profiles.user_id IN ?", userIDs).
		Scan(&result).Error

	return result, err
}

func (repo *ProfileRepository) Update(profile *model.Profile) error {
	return repo.DB.Save(profile).Error
}
