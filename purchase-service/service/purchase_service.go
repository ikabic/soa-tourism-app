package service

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"

	"example.com/purchase-service/dto"
	grpcclient "example.com/purchase-service/grpc"
	"example.com/purchase-service/model"
	"example.com/purchase-service/repo"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseService struct {
	CartRepo     *repo.CartRepository
	PurchaseRepo *repo.PurchaseRepository
	TourClient   *grpcclient.TourClient
}

func (s *PurchaseService) AddToCart(userID uuid.UUID, request dto.AddCartItemRequest, authHeader string) (*dto.CartItemResponse, error) {
	tourID, err := uuid.Parse(request.TourID)
	if err != nil {
		return nil, errors.New("invalid tour_id")
	}

	if request.TourName == "" {
		return nil, errors.New("tour_name is required")
	}
	if request.TourDescription == "" {
		return nil, errors.New("tour_description is required")
	}
	if request.Price < 0 {
		return nil, errors.New("price must be non-negative")
	}

	alreadyPurchased, err := s.PurchaseRepo.Exists(userID, tourID)
	if err != nil {
		return nil, err
	}
	if alreadyPurchased {
		return nil, errors.New("tour already purchased")
	}

	_, err = s.CartRepo.FindByUserAndTour(userID, tourID)
	if err == nil {
		return nil, errors.New("tour already in cart")
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	published, err := s.verifyTourPublished(tourID)
	if err != nil {
		return nil, err
	}
	if !published {
		return nil, errors.New("tour is not available for purchase")
	}

	cartItem := &model.CartItem{
		UserID:          userID,
		TourID:          tourID,
		TourName:        request.TourName,
		TourDescription: request.TourDescription,
		Price:           request.Price,
	}

	if err := s.CartRepo.Create(cartItem); err != nil {
		return nil, err
	}

	return mapCartItem(cartItem), nil
}

func (s *PurchaseService) GetCart(userID uuid.UUID) (*dto.CartResponse, error) {
	items, err := s.CartRepo.FindByUser(userID)
	if err != nil {
		return nil, err
	}

	cartItems := make([]dto.CartItemResponse, 0, len(items))
	total := 0.0
	for _, item := range items {
		if item.TourDescription == "" {
			desc, err := s.getTourDescription(item.TourID)
			if err == nil && desc != "" {
				item.TourDescription = desc
				_ = s.CartRepo.Update(&item)
			}
		}
		cartItems = append(cartItems, *mapCartItem(&item))
		total += item.Price
	}

	return &dto.CartResponse{Items: cartItems, Total: total}, nil
}

func (s *PurchaseService) CreatePurchaseFromCartItem(userID uuid.UUID, item model.CartItem) (*model.Purchase, error) {
	return &model.Purchase{
		UserID:          userID,
		TourID:          item.TourID,
		TourName:        item.TourName,
		TourDescription: item.TourDescription,
		Price:           item.Price,
	}, nil
}

func (s *PurchaseService) RemoveCartItem(userID, itemID uuid.UUID) error {
	return s.CartRepo.DeleteByID(userID, itemID)
}

func (s *PurchaseService) Checkout(userID uuid.UUID) (*dto.CheckoutResponse, error) {
	items, err := s.CartRepo.FindByUser(userID)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, errors.New("cart is empty")
	}

	purchases := make([]dto.PurchaseItemResponse, 0, len(items))
	total := 0.0

	for _, item := range items {
		published, err := s.verifyTourPublished(item.TourID)
		if err != nil {
			return nil, err
		}
		if !published {
			return nil, fmt.Errorf("tour %s is not available for purchase", item.TourName)
		}

		bought, err := s.PurchaseRepo.Exists(userID, item.TourID)
		if err != nil {
			return nil, err
		}
		if bought {
			return nil, fmt.Errorf("tour %s has already been purchased", item.TourName)
		}

		token, err := generateToken()
		if err != nil {
			return nil, err
		}

		purchase := &model.Purchase{
			UserID:          userID,
			TourID:          item.TourID,
			TourName:        item.TourName,
			TourDescription: item.TourDescription,
			Price:           item.Price,
			Token:           token,
		}

		if err := s.PurchaseRepo.Create(purchase); err != nil {
			return nil, err
		}

		purchases = append(purchases, *mapPurchase(purchase))
		total += item.Price
	}

	if err := s.CartRepo.DeleteByUser(userID); err != nil {
		return nil, err
	}

	return &dto.CheckoutResponse{Purchases: purchases, Total: total}, nil
}

func (s *PurchaseService) GetPurchases(userID uuid.UUID) ([]dto.PurchaseItemResponse, error) {
	purchases, err := s.PurchaseRepo.FindByUser(userID)
	if err != nil {
		return nil, err
	}

	response := make([]dto.PurchaseItemResponse, 0, len(purchases))
	for _, purchase := range purchases {
		if purchase.TourDescription == "" {
			desc, err := s.getTourDescription(purchase.TourID)
			if err == nil && desc != "" {
				purchase.TourDescription = desc
				_ = s.PurchaseRepo.Update(&purchase)
			}
		}
		response = append(response, *mapPurchase(&purchase))
	}

	return response, nil
}

func (s *PurchaseService) HasPurchased(userID, tourID uuid.UUID) (bool, error) {
	return s.PurchaseRepo.Exists(userID, tourID)
}

func (s *PurchaseService) getTourDescription(tourID uuid.UUID) (string, error) {
	resp, err := s.TourClient.GetTourPublicInfo(tourID.String())
	if err != nil {
		return "", err
	}
	return resp.Description, nil
}

func (s *PurchaseService) verifyTourPublished(tourID uuid.UUID) (bool, error) {
	return s.TourClient.IsTourPublished(tourID.String())
}

func generateToken() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func mapCartItem(item *model.CartItem) *dto.CartItemResponse {
	return &dto.CartItemResponse{
		ID:              item.ID.String(),
		TourName:        item.TourName,
		TourDescription: item.TourDescription,
		Price:           item.Price,
		CreatedAt:       item.CreatedAt,
	}
}

func mapPurchase(purchase *model.Purchase) *dto.PurchaseItemResponse {
	return &dto.PurchaseItemResponse{
		ID:              purchase.ID.String(),
		TourID:          purchase.TourID.String(),
		TourName:        purchase.TourName,
		TourDescription: purchase.TourDescription,
		Price:           purchase.Price,
		Token:           purchase.Token,
		CreatedAt:       purchase.CreatedAt,
	}
}
