package grpcclient

import (
	"context"
	"log"
	"time"

	pb "proto/follow"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type FollowClient struct {
	client pb.FollowServiceClient
}

func NewFollowClient(address string) *FollowClient {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatal(err)
	}
	return &FollowClient{client: pb.NewFollowServiceClient(conn)}
}

func (c *FollowClient) GetFollowRelationships(userID string) (followers []string, following []string, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	resp, err := c.client.GetFollowRelationships(ctx, &pb.FollowRelationshipsRequest{UserId: userID})
	if err != nil {
		return nil, nil, err
	}
	return resp.FollowerIds, resp.FollowingIds, nil
}
