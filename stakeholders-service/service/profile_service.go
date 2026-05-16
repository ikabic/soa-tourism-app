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
	SnapshotRepo *repo.SagaSnapshotRepository
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

func (s *ProfileService) AnonymizeProfile(userID uuid.UUID) error {
	profile, err := s.Repo.FindByUser(userID)
	if err != nil {
		return err
	}

	if err := s.SnapshotRepo.Save(userID, profile); err != nil {
		return err
	}

	if err := s.Repo.AnonymizeProfile(userID); err != nil {
		s.SnapshotRepo.Delete(userID)
		return err
	}

	return nil
}

func (s *ProfileService) RestoreProfile(userID uuid.UUID) error {
	snap, err := s.SnapshotRepo.Get(userID)
	if err != nil {
		return err
	}

	if err := s.Repo.RestoreProfile(userID, model.Profile{
		Name:      snap.Name,
		LastName:  snap.LastName,
		Biography: snap.Biography,
		Motto:     snap.Motto,
		Avatar:    snap.Avatar,
	}); err != nil {
		return err
	}

	s.SnapshotRepo.Delete(userID)
	return nil
}

func (s *ProfileService) DropSnapshot(userID uuid.UUID) error {
	return s.SnapshotRepo.Delete(userID)
}
