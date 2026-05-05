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
