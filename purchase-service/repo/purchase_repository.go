package repo

import (
	"purchase-service/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseRepository struct {
	DB *gorm.DB
}

func (repo *PurchaseRepository) FindByUser(userID uuid.UUID) ([]model.Purchase, error) {
	var purchases []model.Purchase
	err := repo.DB.Where("user_id = ?", userID).Find(&purchases).Error
	return purchases, err
}

func (repo *PurchaseRepository) Exists(userID, tourID uuid.UUID) (bool, error) {
	var count int64
	err := repo.DB.Model(&model.Purchase{}).Where("user_id = ? AND tour_id = ?", userID, tourID).Count(&count).Error
	return count > 0, err
}

func (repo *PurchaseRepository) Create(purchase *model.Purchase) error {
	return repo.DB.Create(purchase).Error
}

func (repo *PurchaseRepository) Update(purchase *model.Purchase) error {
	return repo.DB.Model(purchase).Updates(map[string]interface{}{
		"tour_description": purchase.TourDescription,
	}).Error
}

func (repo *PurchaseRepository) FindByUserAndTour(userID, tourID uuid.UUID) (*model.Purchase, error) {
	var purchase model.Purchase
	err := repo.DB.Where("user_id = ? AND tour_id = ?", userID, tourID).First(&purchase).Error
	return &purchase, err
}
