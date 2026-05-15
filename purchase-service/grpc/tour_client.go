package grpcclient

import (
	"context"
	"crypto/tls"
	"log"
	"time"

	pb "proto/tour"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type TourClient struct {
	client pb.TourServiceClient
}

func NewTourClient(address string) *TourClient {
	if address == "" {
		log.Fatal("TOUR_SERVICE_GRPC_ADDR is not configured")
	}

	creds := credentials.NewTLS(&tls.Config{
		InsecureSkipVerify: true,
		ServerName:         "tour-app",
	})

	conn, err := grpc.Dial(address, grpc.WithTransportCredentials(creds))
	if err != nil {
		log.Fatal(err)
	}

	return &TourClient{client: pb.NewTourServiceClient(conn)}
}

func (c *TourClient) GetTourPublicInfo(tourID string) (*pb.GetTourPublicInfoResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return c.client.GetTourPublicInfo(ctx, &pb.GetTourPublicInfoRequest{TourId: tourID})
}

func (c *TourClient) IsTourPublished(tourID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := c.client.IsTourPublished(ctx, &pb.IsTourPublishedRequest{TourId: tourID})
	if err != nil {
		return false, err
	}
	return resp.IsPublished, nil
}
