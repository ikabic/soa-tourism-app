package grpcclient

import (
	"context"
	"log"
	"time"

	pb "proto/user"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type UserClient struct {
	client pb.UserServiceClient
}

func NewUserClient(address string) *UserClient {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatal(err)
	}
	return &UserClient{client: pb.NewUserServiceClient(conn)}
}

func (c *UserClient) ValidateUser(userID string) (exists bool, blocked bool, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	resp, err := c.client.ValidateUser(ctx, &pb.ValidateUserRequest{UserId: userID})
	if err != nil {
		return false, false, err
	}
	return resp.Exists, resp.Blocked, nil
}
