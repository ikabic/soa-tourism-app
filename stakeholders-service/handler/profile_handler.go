package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"stakeholders-service.xws.com/dto"
	"stakeholders-service.xws.com/middleware"
	"stakeholders-service.xws.com/service"
)

type ProfileHandler struct {
	Service *service.ProfileService
}

func (handler *ProfileHandler) GetProfile(writer http.ResponseWriter, request *http.Request) {
	vars := mux.Vars(request)
	username := vars["username"]

	profile, err := handler.Service.GetProfile(username, uuid.Nil)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusNotFound)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(profile)
}

func (handler *ProfileHandler) GetProfiles(writer http.ResponseWriter, request *http.Request) {
	ids := request.URL.Query().Get("ids")
	if ids == "" {
		http.Error(writer, "Missing ids", http.StatusBadRequest)
		return
	}

	parts := strings.Split(ids, ",")

	var userIDs []uuid.UUID
	for _, p := range parts {
		id, err := uuid.Parse(p)
		if err != nil {
			http.Error(writer, "Invalid uuid in list", http.StatusBadRequest)
			return
		}
		userIDs = append(userIDs, id)
	}

	profiles, err := handler.Service.GetProfiles(userIDs)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(profiles)
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

	if err := request.ParseMultipartForm(10 << 20); err != nil {
		http.Error(writer, "Invalid form data", http.StatusBadRequest)
		return
	}

	req := dto.ProfileUpdate{
		Name:      request.FormValue("name"),
		LastName:  request.FormValue("last_name"),
		Motto:     request.FormValue("motto"),
		Biography: request.FormValue("biography"),
	}

	file, header, err := request.FormFile("avatar")
	if err == nil {
		defer file.Close()

		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		savePath := filepath.Join("uploads", "avatars", filename)

		dst, err := os.Create(savePath)
		if err != nil {
			http.Error(writer, "Could not save avatar", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(writer, "Could not write avatar", http.StatusInternalServerError)
			return
		}

		req.Avatar = "/uploads/avatars/" + filename
	}

	if err := handler.Service.UpdateProfile(userID, req); err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	updatedProfile, err := handler.Service.GetProfile("", userID)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(updatedProfile)
}
