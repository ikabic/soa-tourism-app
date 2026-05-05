package handler

import (
	"encoding/json"
	"net/http"

	"followers-service.xws.com/middleware"
	"followers-service.xws.com/service"
	"github.com/gorilla/mux"
)

type FollowHandler struct {
	Service *service.FollowService
}

func (h *FollowHandler) Follow(w http.ResponseWriter, r *http.Request) {
	followerID := r.Context().Value(middleware.UserIDKey).(string)
	followedID := mux.Vars(r)["userId"]

	if err := h.Service.Follow(followerID, followedID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "User followed successfully"})
}

func (h *FollowHandler) Unfollow(w http.ResponseWriter, r *http.Request) {
	followerID := r.Context().Value(middleware.UserIDKey).(string)
	followedID := mux.Vars(r)["userId"]

	if err := h.Service.Unfollow(followerID, followedID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "User unfollowed successfully"})
}

func (h *FollowHandler) GetFollowers(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["userId"]
	ids, err := h.Service.GetFollowers(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ids)
}

func (h *FollowHandler) GetFollowing(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["userId"]
	ids, err := h.Service.GetFollowing(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ids)
}
