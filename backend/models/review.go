package models

import "time"

type ReviewCategory struct {
	Category string `json:"category"`
	Rating   int    `json:"rating"`
}

type HostawayReview struct {
	ID             int              `json:"id"`
	Type           string           `json:"type"`
	Status         string           `json:"status"`
	Rating         *int             `json:"rating"`
	PublicReview   string           `json:"publicReview"`
	ReviewCategory []ReviewCategory `json:"reviewCategory"`
	SubmittedAt    string           `json:"submittedAt"`
	GuestName      string           `json:"guestName"`
	ListingName    string           `json:"listingName"`
}

type NormalizedReview struct {
	ID           string            `json:"id"`
	PropertyName string            `json:"propertyName"`
	GuestName    string            `json:"guestName"`
	Review       string            `json:"review"`
	Rating       float64           `json:"rating"`
	Categories   map[string]int    `json:"categories"`
	Date         time.Time         `json:"date"`
	Channel      string            `json:"channel"`
	Type         string            `json:"type"`
	IsApproved   bool              `json:"isApproved"`
}

type HostawayResponse struct {
	Status string           `json:"status"`
	Result []HostawayReview `json:"result"`
}

type Property struct {
	Name            string             `json:"name"`
	TotalReviews    int                `json:"totalReviews"`
	AverageRating   float64            `json:"averageRating"`
	ApprovedReviews []NormalizedReview `json:"approvedReviews"`
}