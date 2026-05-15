package service

import (
	"github.com/google/uuid"
	"stakeholders-service.xws.com/dto"
	grpcclient "stakeholders-service.xws.com/grpc"
	"stakeholders-service.xws.com/model"
	"stakeholders-service.xws.com/repo"
)

type ProfileService struct {
	Repo         *repo.ProfileRepository
	UserRepo     *repo.UserRepository
	FollowClient *grpcclient.FollowClient
}

func (service *ProfileService) GetProfile(username string, userId uuid.UUID) (*dto.ProfileResponse, error) {
	var profile *model.Profile
	var err error

	if username != "" {
		profile, err = service.Repo.FindByUsername(username)
	} else {
		profile, err = service.Repo.FindByUser(userId)
	}

	if err != nil {
		return nil, err
	}

	resp := &dto.ProfileResponse{
		ID:               profile.UserID.String(),
		Username:         username,
		Name:             profile.Name,
		LastName:         profile.LastName,
		Avatar:           profile.Avatar,
		Biography:        profile.Biography,
		Motto:            profile.Motto,
		CurrentLatitude:  profile.CurrentLatitude,
		CurrentLongitude: profile.CurrentLongitude,
		Followers:        []string{},
		Following:        []string{},
	}

	if service.FollowClient != nil {
		followers, following, err := service.FollowClient.GetFollowRelationships(profile.UserID.String())

		if err == nil {
			if following == nil {
				resp.Following = []string{}
			} else {
				resp.Following = following
			}

			if followers == nil {
				resp.Followers = []string{}
			} else {
				resp.Followers = followers
			}
		}
	}

	return resp, nil
}

func (s *ProfileService) GetProfiles(userIDs []uuid.UUID) ([]dto.ProfileResponse, error) {

	profiles, err := s.Repo.GetProfiles(userIDs)
	if err != nil {
		return nil, err
	}

	resp := make([]dto.ProfileResponse, 0, len(profiles))

	for _, p := range profiles {
		resp = append(resp, dto.ProfileResponse{
			ID:       p.UserID.String(),
			Username: p.Username,
			Name:     p.Name,
			LastName: p.LastName,
			Avatar:   p.Avatar,
		})
	}

	return resp, nil
}

func (service *ProfileService) UpdateProfile(userID uuid.UUID, request dto.ProfileUpdate) error {
	profile, err := service.Repo.FindByUser(userID)
	if err != nil {
		return err
	}

	if request.Name != "" {
		profile.Name = request.Name
	}

	if request.LastName != "" {
		profile.LastName = request.LastName
	}

	if request.Avatar != "" {
		profile.Avatar = request.Avatar
	}

	profile.Biography = request.Biography
	profile.Motto = request.Motto

	if request.CurrentLatitude != nil {
		profile.CurrentLatitude = request.CurrentLatitude
	}
	if request.CurrentLongitude != nil {
		profile.CurrentLongitude = request.CurrentLongitude
	}

	return service.Repo.Update(profile)
}
