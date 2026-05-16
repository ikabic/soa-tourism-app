package grpcclient

import (
	"context"
	"log"
	"net"
	"os"

	pb "proto/purchase"

	"example.com/purchase-service/repo"
	"github.com/google/uuid"
	"google.golang.org/grpc"
)

type PurchaseGrpcServer struct {
	pb.UnimplementedPurchaseServiceServer
	PurchaseRepo *repo.PurchaseRepository
}

func (s *PurchaseGrpcServer) HasPurchased(ctx context.Context, req *pb.HasPurchasedRequest) (*pb.HasPurchasedResponse, error) {
	userID, err := uuid.Parse(req.UserId)
	if err != nil {
		return &pb.HasPurchasedResponse{Purchased: false}, nil
	}
	tourID, err := uuid.Parse(req.TourId)
	if err != nil {
		return &pb.HasPurchasedResponse{Purchased: false}, nil
	}

	purchased, err := s.PurchaseRepo.Exists(userID, tourID)
	if err != nil {
		return &pb.HasPurchasedResponse{Purchased: false}, nil
	}

	return &pb.HasPurchasedResponse{Purchased: purchased}, nil
}

func StartGRPCServer(purchaseRepo *repo.PurchaseRepository) {
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen on gRPC port: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterPurchaseServiceServer(s, &PurchaseGrpcServer{PurchaseRepo: purchaseRepo})

	log.Printf("Purchase gRPC server starting on port: %s", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("gRPC server failed: %v", err)
	}
}
