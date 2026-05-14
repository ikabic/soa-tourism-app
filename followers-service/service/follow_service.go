package service

import (
	"errors"

	"followers-service.xws.com/repo"
)

type FollowService struct {
	Repo *repo.FollowRepository
}

func (s *FollowService) Follow(followerID, followedID string) error {
	if followerID == followedID {
		return errors.New("You cannot follow yourself")
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

func (s *FollowService) GetRecommendations(userID string) ([]string, error) {
	return s.Repo.GetRecommendations(userID)
}

func (s *FollowService) CanReadBlog(followerID, authorID string) (bool, error) {
	if followerID == authorID {
		return true, nil
	}
	return s.Repo.IsFollowing(followerID, authorID)
}
