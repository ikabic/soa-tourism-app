package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"example.com/purchase-service/dto"
	"example.com/purchase-service/middleware"
	"example.com/purchase-service/service"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type PurchaseHandler struct {
	Service *service.PurchaseService
}

func (h *PurchaseHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	cart, err := h.Service.GetCart(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, cart)
}

func (h *PurchaseHandler) AddCartItem(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var req dto.AddCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	authHeader := r.Header.Get("Authorization")
	cartItem, err := h.Service.AddToCart(userID, req, authHeader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, cartItem)
}

func (h *PurchaseHandler) RemoveCartItem(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	itemID, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "invalid item id", http.StatusBadRequest)
		return
	}

	if err := h.Service.RemoveCartItem(userID, itemID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *PurchaseHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	checkout, err := h.Service.Checkout(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, checkout)
}

func (h *PurchaseHandler) GetPurchases(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	purchases, err := h.Service.GetPurchases(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, purchases)
}

func (h *PurchaseHandler) GetPurchaseStatus(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	tourID, err := uuid.Parse(vars["tourId"])
	if err != nil {
		http.Error(w, "invalid tour id", http.StatusBadRequest)
		return
	}

	purchased, err := h.Service.HasPurchased(userID, tourID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, dto.PurchaseStatusResponse{Purchased: purchased})
}

func getUserID(r *http.Request) (uuid.UUID, error) {
	userIDVal := r.Context().Value(middleware.UserIDKey)
	userIDStr, ok := userIDVal.(string)
	if !ok || userIDStr == "" {
		return uuid.Nil, errors.New("unauthorized")
	}
	return uuid.Parse(userIDStr)
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payload)
}
