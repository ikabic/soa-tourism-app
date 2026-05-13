package dto

type ProfileUpdate struct {
	Name             string   `json:"name"`
	LastName         string   `json:"last_name"`
	Avatar           string   `json:"avatar"`
	Biography        string   `json:"biography"`
	Motto            string   `json:"motto"`
	CurrentLatitude  *float64 `json:"current_latitude"`
	CurrentLongitude *float64 `json:"current_longitude"`
}
