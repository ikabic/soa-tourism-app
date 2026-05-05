package dto

type FollowRequest struct {
	FollowingID string `json:"followingId"`
}

type FollowersResponse struct {
	UserIDs []string `json:"userIds"`
}
