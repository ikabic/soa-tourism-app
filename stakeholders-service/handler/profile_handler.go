package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/middleware"
	"stakeholders-service.xws.com/service"
)

type ProfileHandler struct {
	Service *service.ProfileService
}

func (handler *ProfileHandler) GetProfile(writer http.ResponseWriter, request *http.Request) {
	userIDVal := request.Context().Value(middleware.UserIDKey)
	userIDStr, ok := userIDVal.(string)
	if !ok {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(writer, "Invalid user ID", http.StatusBadRequest)
		return
	}

	profile, err := handler.Service.GetProfile(userID)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusNotFound)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(profile)
}

func (handler *ProfileHandler) UpdateProfile(writer http.ResponseWriter, request *http.Request) {
	userIDVal := request.Context().Value(middleware.UserIDKey)
	userIDStr, ok := userIDVal.(string)
	if !ok {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(writer, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req dto.ProfileUpdate
	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	if err := handler.Service.UpdateProfile(userID, req); err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(map[string]string{"message": "Profile updated successfully"})
}
