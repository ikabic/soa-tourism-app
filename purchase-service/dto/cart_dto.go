package dto

import "time"

type AddCartItemRequest struct {
	TourID          string  `json:"tour_id"`
	TourName        string  `json:"tour_name"`
	TourDescription string  `json:"tour_description"`
	Price           float64 `json:"price"`
}

type CartItemResponse struct {
	ID              string    `json:"id"`
	TourName        string    `json:"tour_name"`
	TourDescription string    `json:"tour_description"`
	Price           float64   `json:"price"`
	CreatedAt       time.Time `json:"created_at"`
}

type CartResponse struct {
	Items []CartItemResponse `json:"items"`
	Total float64            `json:"total"`
}

type PurchaseItemResponse struct {
	ID              string    `json:"id"`
	TourID          string    `json:"tour_id"`
	TourName        string    `json:"tour_name"`
	TourDescription string    `json:"tour_description"`
	Price           float64   `json:"price"`
	Token           string    `json:"token"`
	CreatedAt       time.Time `json:"created_at"`
}

type CheckoutResponse struct {
	Purchases []PurchaseItemResponse `json:"purchases"`
	Total     float64                `json:"total"`
}

type PurchaseStatusResponse struct {
	Purchased bool `json:"purchased"`
}
