package model

type FollowRelationSnapshot struct {
	UserID        string   `json:"userId"`
	WasFollowing  []string `json:"wasFollowing"`
	WasFollowedBy []string `json:"wasFollowedBy"`
}
