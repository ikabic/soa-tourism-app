package model

type FollowRelation struct {
	FollowerID  string `json:"followerId" gorm:"type:string;not null"`
	FollowingID string `json:"followedId" gorm:"type:string;not null"`
}
