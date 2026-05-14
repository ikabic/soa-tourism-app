package grpcclient

import (
	"context"
	"log"
	"net"
	"os"

	"github.com/google/uuid"
	pb "proto/user"
	"stakeholders-service.xws.com/repo"

	"google.golang.org/grpc"
)

type UserGrpcServer struct {
	pb.UnimplementedUserServiceServer
	UserRepo *repo.UserRepository
}

func (s *UserGrpcServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
	parsedID, err := uuid.Parse(req.UserId)
	if err != nil {
		return &pb.GetUserResponse{Exists: false}, nil
	}

	user := s.UserRepo.FindByID(parsedID)
	if user == nil || user.ID == uuid.Nil {
		return &pb.GetUserResponse{Exists: false}, nil
	}

	return &pb.GetUserResponse{
		UserId:   user.ID.String(),
		Username: user.Username,
		Email:    user.Email,
		Exists:   true,
	}, nil
}

func StartGRPCServer(userRepo *repo.UserRepository) {
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen on gRPC port: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterUserServiceServer(s, &UserGrpcServer{UserRepo: userRepo})

	log.Printf("gRPC starting on port: %s", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("gRPC server failed: %v", err)
	}
}