package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Profile struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"`
	Name      string    `json:"name,omitempty" gorm:"type:string;default: null"`
	LastName  string    `json:"last_name,omitempty" gorm:"type:string;default: null"`
	Avatar    string    `json:"avatar,omitempty" gorm:"type:string;default: null"`
	Biography string    `json:"biography,omitempty" gorm:"type:text;default: null"`
	Motto     string    `json:"motto,omitempty" gorm:"type:string;default: null"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
}

func (profile *Profile) BeforeCreate(scope *gorm.DB) error {
	profile.ID = uuid.New()
	return nil
}
