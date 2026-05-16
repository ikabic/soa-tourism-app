package model

import "github.com/google/uuid"

type ProfileSnapshot struct {
	UserID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex;primaryKey"`
	Name      string    `json:"name,omitempty" gorm:"type:string;default: null"`
	LastName  string    `json:"last_name,omitempty" gorm:"type:string;default: null"`
	Avatar    string    `json:"avatar,omitempty" gorm:"type:string;default: null"`
	Biography string    `json:"biography,omitempty" gorm:"type:text;default: null"`
	Motto     string    `json:"motto,omitempty" gorm:"type:string;default: null"`
}
