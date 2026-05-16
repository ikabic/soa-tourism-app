package repo

import (
	"context"
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type FollowRepository struct {
	Driver neo4j.DriverWithContext
}

func (r *FollowRepository) Follow(followerID, followedID string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		_, err := tx.Run(ctx, `
            MERGE (a:User {id: $followerId})
            MERGE (b:User {id: $followedId})
            MERGE (a)-[:FOLLOWS]->(b)
        `, map[string]any{
			"followerId": followerID,
			"followedId": followedID,
		})
		return nil, err
	})
	return err
}

func (r *FollowRepository) Unfollow(followerID, followedID string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		_, err := tx.Run(ctx, `
            MATCH (a:User {id: $followerId})-[r:FOLLOWS]->(b:User {id: $followedId})
            DELETE r
        `, map[string]any{
			"followerId": followerID,
			"followedId": followedID,
		})
		return nil, err
	})
	return err
}

func (r *FollowRepository) GetFollowers(userID string) ([]string, error) {
	return r.queryUserIDs(`
        MATCH (a:User)-[:FOLLOWS]->(b:User {id: $userId})
        RETURN a.id AS id
    `, userID)
}

func (r *FollowRepository) GetFollowing(userID string) ([]string, error) {
	return r.queryUserIDs(`
        MATCH (a:User {id: $userId})-[:FOLLOWS]->(b:User)
        RETURN b.id AS id
    `, userID)
}

func (r *FollowRepository) queryUserIDs(query, userID string) ([]string, error) {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		records, err := tx.Run(ctx, query, map[string]any{"userId": userID})
		if err != nil {
			return nil, err
		}
		var ids []string
		for records.Next(ctx) {
			id, ok := records.Record().Get("id")
			if ok {
				ids = append(ids, fmt.Sprintf("%v", id))
			}
		}
		return ids, records.Err()
	})
	if err != nil {
		return nil, err
	}
	return result.([]string), nil
}

func (r *FollowRepository) GetRecommendations(userID string) ([]string, error) {
	return r.queryUserIDs(` MATCH (me:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(rec:User) WHERE rec.id <> $userId  AND NOT (me)-[:FOLLOWS]->(rec) RETURN DISTINCT rec.id AS id`, userID)
}

func (r *FollowRepository) IsFollowing(followerID, followedID string) (bool, error) {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		records, err := tx.Run(ctx, `MATCH (a:User {id: $followerId})-[:FOLLOWS]->(b:User {id: $followedId}) RETURN count(*) > 0 AS follows`, map[string]any{
			"followerId": followerID,
			"followedId": followedID,
		})
		if err != nil {
			return false, err
		}
		if records.Next(ctx) {
			val, _ := records.Record().Get("follows")
			return val.(bool), nil
		}
		return false, records.Err()
	})
	if err != nil {
		return false, err
	}
	return result.(bool), nil
}

func (r *FollowRepository) RemoveUserRelations(userID string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		_, err := tx.Run(ctx, `
			MATCH (u:User {id: $userId})-[r:FOLLOWS]-(:User)
			DELETE r
		`, map[string]any{"userId": userID})
		return nil, err
	})
	return err
}

func (r *FollowRepository) RestoreRelations(userID string, wasFollowing []string, wasFollowedBy []string) error {
	ctx := context.Background()
	session := r.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		if _, err := tx.Run(ctx, `
            UNWIND $followed AS followedID
            MERGE (a:User {id: $userId})
            MERGE (b:User {id: followedID})
            MERGE (a)-[:FOLLOWS]->(b)
        `, map[string]any{
			"userId":   userID,
			"followed": wasFollowing,
		}); err != nil {
			return nil, err
		}

		_, err := tx.Run(ctx, `
            UNWIND $followers AS followerID
            MERGE (a:User {id: followerID})
            MERGE (b:User {id: $userId})
            MERGE (a)-[:FOLLOWS]->(b)
        `, map[string]any{
			"userId":    userID,
			"followers": wasFollowedBy,
		})
		return nil, err
	})
	return err
}
