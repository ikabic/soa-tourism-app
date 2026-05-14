package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartItem struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID          uuid.UUID `gorm:"type:uuid;not null;index;uniqueIndex:idx_cart_user_tour"`
	TourID          uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_cart_user_tour"`
	TourName        string    `gorm:"type:text;not null"`
	TourDescription string    `gorm:"type:text;not null;default:''"`
	Price           float64   `gorm:"type:double precision;not null"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
}

func (item *CartItem) BeforeCreate(tx *gorm.DB) error {
	item.ID = uuid.New()
	return nil
}
