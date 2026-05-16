package repo

import (
	"context"
	"encoding/json"

	"followers-service.xws.com/model"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type SagaSnapshotRepository struct {
	Driver neo4j.DriverWithContext
}

func (r *SagaSnapshotRepository) Save(userID string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		followingResult, err := tx.Run(ctx, `
			MATCH (u:User {id: $userId})-[:FOLLOWS]->(b:User)
			RETURN b.id AS id
		`, map[string]any{"userId": userID})

		if err != nil {
			return nil, err
		}

		var asFollower []string
		for followingResult.Next(ctx) {
			id, _ := followingResult.Record().Get("id")
			asFollower = append(asFollower, id.(string))
		}

		followersResult, err := tx.Run(ctx, `
			MATCH (a:User)-[:FOLLOWS]->(u:User {id: $userId})
			RETURN a.id AS id
		`, map[string]any{"userId": userID})

		if err != nil {
			return nil, err
		}

		var asFollowed []string
		for followersResult.Next(ctx) {
			id, _ := followersResult.Record().Get("id")
			asFollowed = append(asFollowed, id.(string))
		}

		asFollowerJSON, _ := json.Marshal(asFollower)
		asFollowedJSON, _ := json.Marshal(asFollowed)

		_, err = tx.Run(ctx, `
			MERGE (s:FollowSnapshot {userId: $userId})
			ON CREATE SET s.asFollower = $asFollower, s.asFollowed = $asFollowed
		`, map[string]any{
			"userId":     userID,
			"asFollower": string(asFollowerJSON),
			"asFollowed": string(asFollowedJSON),
		})
		return nil, err
	})
	return err
}

func (r *SagaSnapshotRepository) Get(userID string) (*model.FollowRelationSnapshot, error) {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		records, err := tx.Run(ctx, `
			MATCH (s:FollowSnapshot {userId: $userId})
			RETURN s.asFollower AS asFollower, s.asFollowed AS asFollowed
		`, map[string]any{"userId": userID})
		if err != nil {
			return nil, err
		}
		if records.Next(ctx) {
			rec := records.Record()
			asFollowerRaw, _ := rec.Get("asFollower")
			asFollowedRaw, _ := rec.Get("asFollowed")

			var wasFollowing, wasFollowedBy []string
			json.Unmarshal([]byte(asFollowerRaw.(string)), &wasFollowing)
			json.Unmarshal([]byte(asFollowedRaw.(string)), &wasFollowedBy)

			return &model.FollowRelationSnapshot{
				UserID:        userID,
				WasFollowing:  wasFollowing,
				WasFollowedBy: wasFollowedBy,
			}, nil
		}
		return nil, records.Err()
	})
	if err != nil {
		return nil, err
	}
	if result == nil {
		return nil, nil
	}
	return result.(*model.FollowRelationSnapshot), nil
}

func (r *SagaSnapshotRepository) Delete(userID string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		_, err := tx.Run(ctx, `
			MATCH (s:FollowSnapshot {userId: $userId})
			DELETE s
		`, map[string]any{"userId": userID})
		return nil, err
	})
	return err
}
