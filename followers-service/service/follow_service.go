package service

import (
	"errors"
	"log"

	"followers-service.xws.com/repo"
)

type FollowService struct {
	Repo         *repo.FollowRepository
	SnapshotRepo *repo.SagaSnapshotRepository
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

func (s *FollowService) RemoveUserRelations(userID string) error {
	if err := s.SnapshotRepo.Save(userID); err != nil {
		return err
	}

	if err := s.Repo.RemoveUserRelations(userID); err != nil {
		s.SnapshotRepo.Delete(userID)
		return err
	}

	return nil
}

func (s *FollowService) RestoreRelations(userID string) error {
	snap, err := s.SnapshotRepo.Get(userID)
	if err != nil {
		return err
	}
	
	if snap == nil {
		return nil
	}

	if err := s.Repo.RestoreRelations(userID, snap.WasFollowing, snap.WasFollowedBy); err != nil {
		return err
	}

	if err := s.SnapshotRepo.Delete(userID); err != nil {
		log.Printf("WARN: snapshot delete failed for user %s after successful restore: %v", userID, err)
	}

	return nil
}

func (s *FollowService) DropSnapshot(userID string) error {
	if err := s.SnapshotRepo.Delete(userID); err != nil {
		log.Printf("WARN: snapshot delete failed for user %s after successful restore: %v", userID, err)
	}
	return nil
}
