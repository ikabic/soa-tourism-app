package handler

import (
	"encoding/json"
	"net/http"

	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/service"
	
)

type UserHandler struct {
	Service *service.UserService
}

func (handler *UserHandler) Register(w http.ResponseWriter, request *http.Request) {
	var req dto.RegisterRequest

	err := json.NewDecoder(request.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = handler.Service.Register(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]string{
		"message": "User registered successfully",
	})
}

func (handler *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req dto.LoginRequest

    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    token, err := handler.Service.Login(req)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    w.Header().Set("Content-Type", "application/json")

    json.NewEncoder(w).Encode(map[string]string{
        "token": token,
    })
}