package service

import (
	"errors"

	"followers-service.xws.com/grpcclient"
	"followers-service.xws.com/repo"
)

type FollowService struct {
	Repo       *repo.FollowRepository
	UserClient *grpcclient.UserClient
}

func (s *FollowService) Follow(followerID, followedID string) error {
	if followerID == followedID {
		return errors.New("You cannot follow yourself")
	}
	if err := s.ValidateUser(followedID); err != nil {
		return err
	}
	return s.Repo.Follow(followerID, followedID)
}

func (s *FollowService) Unfollow(followerID, followedID string) error {
	return s.Repo.Unfollow(followerID, followedID)
}

func (s *FollowService) GetFollowers(userID string) ([]string, error) {
	return s.Repo.GetFollowers(userID)
}

func (s *FollowService) GetFollowing(userID string) ([]string, error) {
	return s.Repo.GetFollowing(userID)
}

func (s *FollowService) ValidateUser(userID string) error {
	exists, blocked, err := s.UserClient.ValidateUser(userID)
	if err != nil {
		return errors.New("Could not validate user: " + err.Error())
	}
	if !exists {
		return errors.New("User does not exist")
	}
	if blocked {
		return errors.New("User is blocked")
	}
	return nil
}
