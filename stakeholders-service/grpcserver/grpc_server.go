package grpcserver

import (
	"context"
	"log"
	"net"
	"os"

	pb "proto/user"

	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"stakeholders-service.xws.com/repo"
)

type UserServiceServer struct {
	pb.UnimplementedUserServiceServer
	Repo *repo.UserRepository
}

func (s *UserServiceServer) ValidateUser(ctx context.Context, req *pb.ValidateUserRequest) (*pb.ValidateUserResponse, error) {
	id, err := uuid.Parse(req.UserId)
	if err != nil {
		return &pb.ValidateUserResponse{
			Exists:  false,
			Blocked: false,
		}, nil
	}

	user := s.Repo.FindByID(id)

	if user == nil || user.ID == uuid.Nil {
		return &pb.ValidateUserResponse{Exists: false}, nil
	}

	return &pb.ValidateUserResponse{
		Exists:  true,
		Blocked: user.IsBlocked,
	}, nil
}

func StartGRPCServer(repo *repo.UserRepository) {
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

	pb.RegisterUserServiceServer(grpcServer, &UserServiceServer{Repo: repo})
	reflection.Register(grpcServer)
	grpcServer.Serve(lis)
}
