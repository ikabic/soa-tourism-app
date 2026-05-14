package grpcserver

import (
	"context"
	"log"
	"net"
	"os"

	pb "proto/follow"

	"followers-service.xws.com/repo"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type FollowServiceServer struct {
	pb.UnimplementedFollowServiceServer
	Repo *repo.FollowRepository
}

func (s *FollowServiceServer) GetFollowRelationships(ctx context.Context, req *pb.FollowRelationshipsRequest) (*pb.FollowRelationshipsResponse, error) {
	followers, err := s.Repo.GetFollowers(req.UserId)
	if err != nil {
		return nil, err
	}

	following, err := s.Repo.GetFollowing(req.UserId)
	if err != nil {
		return nil, err
	}

	return &pb.FollowRelationshipsResponse{
		FollowerIds:  followers,
		FollowingIds: following,
	}, nil
}

func (s *FollowServiceServer) IsFollowing(ctx context.Context, req *pb.IsFollowingRequest) (*pb.IsFollowingResponse, error) {
    result, err := s.Repo.IsFollowing(req.FollowerId, req.FollowedId)
    if err != nil {
        return nil, err
    }
    return &pb.IsFollowingResponse{IsFollowing: result}, nil
}

func StartGRPCServer(repo *repo.FollowRepository) {
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50051"
	}

	log.Println("gRPC starting on port:", port)

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal(err)
	}

	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)

	pb.RegisterFollowServiceServer(grpcServer, &FollowServiceServer{Repo: repo})
	reflection.Register(grpcServer)
	grpcServer.Serve(lis)
}
