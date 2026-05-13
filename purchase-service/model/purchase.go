package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Purchase struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID          uuid.UUID `gorm:"type:uuid;not null;index;uniqueIndex:idx_purchase_user_tour"`
	TourID          uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_purchase_user_tour"`
	TourName        string    `gorm:"type:text;not null"`
	TourDescription string    `gorm:"type:text;not null;default:''"`
	Price           float64   `gorm:"type:double precision;not null"`
	Token           string    `gorm:"type:text;not null;uniqueIndex"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
}

func (purchase *Purchase) BeforeCreate(tx *gorm.DB) error {
	purchase.ID = uuid.New()
	return nil
}
