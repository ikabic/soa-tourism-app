package repo

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"stakeholders-service.xws.com/model"
)

type SagaSnapshotRepository struct {
	DB *gorm.DB
}

func (repo *SagaSnapshotRepository) Save(userID uuid.UUID, profile *model.Profile) error {
	snap := model.ProfileSnapshot{
		UserID:    userID,
		Name:      profile.Name,
		LastName:  profile.LastName,
		Biography: profile.Biography,
		Motto:     profile.Motto,
		Avatar:    profile.Avatar,
	}
	return repo.DB.Save(&snap).Error
}

func (repo *SagaSnapshotRepository) Get(userID uuid.UUID) (*model.ProfileSnapshot, error) {
	var snap model.ProfileSnapshot
	err := repo.DB.Where("user_id = ?", userID).First(&snap).Error
	return &snap, err
}

func (repo *SagaSnapshotRepository) Delete(userID uuid.UUID) error {
	return repo.DB.Where("user_id = ?", userID).Delete(&model.ProfileSnapshot{}).Error
}
