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
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Username  string    `json:"username" gorm:"type:string;not null;uniqueIndex"`
	Password  string    `json:"-" gorm:"type:string;not null"`
	Email     string    `json:"email" gorm:"type:string;not null;uniqueIndex"`
	Role      Role      `json:"role,omitempty" gorm:"type:string;default: null"`
	Profile   *Profile  `json:"profile,omitempty" gorm:"foreignKey:UserID"`
	IsBlocked bool      `json:"isBlocked" gorm:"default:false"`
}

func (user *User) BeforeCreate(scope *gorm.DB) error {
	user.ID = uuid.New()
	return nil
}

func (user *User) AfterCreate(db *gorm.DB) error {
	profile := Profile{
		UserID: user.ID,
	}
	return db.Create(&profile).Error
}
