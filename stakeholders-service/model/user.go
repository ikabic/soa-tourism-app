package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	Admin   Role = "admin"
	Tourist Role = "tourist"
	Guide   Role = "guide"
)

type User struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Username string    `json:"username" gorm:"type:string;not null;uniqueIndex"`
	Password string    `json:"-" gorm:"type:string;not null"`
	Email    string    `json:"email" gorm:"type:string;not null;uniqueIndex"`
	Role     Role      `json:"role,omitempty" gorm:"type:string;default: null"`
}

func (user *User) BeforeCreate(scope *gorm.DB) error {
	user.ID = uuid.New()
	return nil
}
