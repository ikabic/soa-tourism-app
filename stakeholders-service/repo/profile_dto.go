package repo

import "github.com/google/uuid"

type ProfileDTO struct {
	UserID   uuid.UUID
	Username string
	Name     string
	LastName string
	Avatar   string
}
