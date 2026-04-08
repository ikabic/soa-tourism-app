package service

import (
	"github.com/google/uuid"
	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/repo"
)

type ProfileService struct {
	Repo *repo.ProfileRepository
}

func (service *ProfileService) GetProfile(userID uuid.UUID) (*model.Profile, error) {
	return service.Repo.FindByUser(userID)
}

func (service *ProfileService) UpdateProfile(userID uuid.UUID, request dto.ProfileUpdate) error {
	profile, err := service.Repo.FindByUser(userID)
	if err != nil {
		return err
	}

	profile.Name = request.Name
	profile.LastName = request.LastName
	profile.Avatar = request.Avatar
	profile.Biography = request.Biography
	profile.Motto = request.Motto

	return service.Repo.Update(profile)
}
