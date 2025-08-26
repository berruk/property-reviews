package services

import (
	"strconv"
	"strings"
	"time"

	"flexliving-reviews/models"
	"github.com/google/uuid"
)

type ReviewService struct {
	reviews []models.NormalizedReview
}

func NewReviewService() *ReviewService {
	service := &ReviewService{
		reviews: make([]models.NormalizedReview, 0),
	}
	service.loadMockData()
	return service
}

func (rs *ReviewService) loadMockData() {
	mockData := []models.HostawayReview{
		{
			ID:           1,
			Type:         "guest-to-host",
			Status:       "published",
			Rating:       nil,
			PublicReview: "Amazing property! Super clean and great location. Would definitely stay again.",
			ReviewCategory: []models.ReviewCategory{
				{Category: "cleanliness", Rating: 10},
				{Category: "communication", Rating: 9},
				{Category: "location", Rating: 10},
			},
			SubmittedAt: "2024-01-15 14:30:00",
			GuestName:   "John Smith",
			ListingName: "2B N1 A - 29 Shoreditch Heights",
		},
		{
			ID:           2,
			Type:         "guest-to-host",
			Status:       "published",
			Rating:       nil,
			PublicReview: "Good place but could be cleaner. Host was responsive though.",
			ReviewCategory: []models.ReviewCategory{
				{Category: "cleanliness", Rating: 6},
				{Category: "communication", Rating: 9},
				{Category: "value", Rating: 8},
			},
			SubmittedAt: "2024-01-20 09:15:00",
			GuestName:   "Sarah Johnson",
			ListingName: "1B W2 B - 42 Camden Square",
		},
		{
			ID:           3,
			Type:         "guest-to-host",
			Status:       "published",
			Rating:       nil,
			PublicReview: "Perfect stay! Everything was as described. Highly recommend.",
			ReviewCategory: []models.ReviewCategory{
				{Category: "cleanliness", Rating: 10},
				{Category: "communication", Rating: 10},
				{Category: "accuracy", Rating: 10},
				{Category: "location", Rating: 9},
			},
			SubmittedAt: "2024-01-25 16:45:00",
			GuestName:   "Mike Wilson",
			ListingName: "3B E1 C - 15 Canary Wharf",
		},
		{
			ID:           4,
			Type:         "guest-to-host",
			Status:       "published",
			Rating:       nil,
			PublicReview: "Decent place but noise from the street was an issue.",
			ReviewCategory: []models.ReviewCategory{
				{Category: "cleanliness", Rating: 8},
				{Category: "communication", Rating: 8},
				{Category: "location", Rating: 5},
			},
			SubmittedAt: "2024-02-01 11:20:00",
			GuestName:   "Emma Davis",
			ListingName: "2B N1 A - 29 Shoreditch Heights",
		},
		{
			ID:           5,
			Type:         "guest-to-host",
			Status:       "published",
			Rating:       nil,
			PublicReview: "Excellent value for money. Clean and well-maintained.",
			ReviewCategory: []models.ReviewCategory{
				{Category: "cleanliness", Rating: 9},
				{Category: "value", Rating: 10},
				{Category: "communication", Rating: 9},
			},
			SubmittedAt: "2024-02-05 13:30:00",
			GuestName:   "David Brown",
			ListingName: "1B W2 B - 42 Camden Square",
		},
	}

	for _, hostaway := range mockData {
		normalized := rs.normalizeReview(hostaway)
		rs.reviews = append(rs.reviews, normalized)
	}
}

func (rs *ReviewService) normalizeReview(hr models.HostawayReview) models.NormalizedReview {
	categories := make(map[string]int)
	var totalRating float64
	var count int

	for _, cat := range hr.ReviewCategory {
		categories[cat.Category] = cat.Rating
		totalRating += float64(cat.Rating)
		count++
	}

	avgRating := totalRating / float64(count)
	date, _ := time.Parse("2006-01-02 15:04:05", hr.SubmittedAt)

	return models.NormalizedReview{
		ID:           uuid.New().String(),
		PropertyName: hr.ListingName,
		GuestName:    hr.GuestName,
		Review:       hr.PublicReview,
		Rating:       avgRating,
		Categories:   categories,
		Date:         date,
		Channel:      "hostaway",
		Type:         hr.Type,
		IsApproved:   false,
	}
}

func (rs *ReviewService) GetReviews(property, sortBy, filterRating string) []models.NormalizedReview {
	filtered := rs.reviews

	if property != "" {
		var temp []models.NormalizedReview
		for _, review := range filtered {
			if strings.Contains(strings.ToLower(review.PropertyName), strings.ToLower(property)) {
				temp = append(temp, review)
			}
		}
		filtered = temp
	}

	if filterRating != "" {
		minRating, err := strconv.ParseFloat(filterRating, 64)
		if err == nil {
			var temp []models.NormalizedReview
			for _, review := range filtered {
				if review.Rating >= minRating {
					temp = append(temp, review)
				}
			}
			filtered = temp
		}
	}

	if sortBy == "rating" {
		for i := 0; i < len(filtered)-1; i++ {
			for j := 0; j < len(filtered)-i-1; j++ {
				if filtered[j].Rating < filtered[j+1].Rating {
					filtered[j], filtered[j+1] = filtered[j+1], filtered[j]
				}
			}
		}
	} else if sortBy == "date" {
		for i := 0; i < len(filtered)-1; i++ {
			for j := 0; j < len(filtered)-i-1; j++ {
				if filtered[j].Date.Before(filtered[j+1].Date) {
					filtered[j], filtered[j+1] = filtered[j+1], filtered[j]
				}
			}
		}
	}

	return filtered
}

func (rs *ReviewService) ApproveReview(reviewID string, isApproved bool) error {
	for i, review := range rs.reviews {
		if review.ID == reviewID {
			rs.reviews[i].IsApproved = isApproved
			return nil
		}
	}
	return nil
}

func (rs *ReviewService) GetProperties() []models.Property {
	propertyMap := make(map[string]int)

	for _, review := range rs.reviews {
		propertyMap[review.PropertyName]++
	}

	var properties []models.Property
	for name, count := range propertyMap {
		var totalRating float64
		var reviewCount int
		var approved []models.NormalizedReview

		for _, review := range rs.reviews {
			if review.PropertyName == name {
				totalRating += review.Rating
				reviewCount++
				if review.IsApproved {
					approved = append(approved, review)
				}
			}
		}

		avgRating := totalRating / float64(reviewCount)

		properties = append(properties, models.Property{
			Name:            name,
			TotalReviews:    count,
			AverageRating:   avgRating,
			ApprovedReviews: approved,
		})
	}

	return properties
}