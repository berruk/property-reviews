package handlers

import (
	"net/http"

	"flexliving-reviews/services"
	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
}

func NewReviewHandler(reviewService *services.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

func (rh *ReviewHandler) GetReviews(c *gin.Context) {
	property := c.Query("property")
	sortBy := c.Query("sort")
	filterRating := c.Query("rating")

	reviews := rh.reviewService.GetReviews(property, sortBy, filterRating)
	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

func (rh *ReviewHandler) ApproveReview(c *gin.Context) {
	reviewID := c.Param("id")

	var requestBody struct {
		IsApproved bool `json:"isApproved"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := rh.reviewService.ApproveReview(reviewID, requestBody.IsApproved)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review updated"})
}

func (rh *ReviewHandler) GetProperties(c *gin.Context) {
	properties := rh.reviewService.GetProperties()
	c.JSON(http.StatusOK, gin.H{"properties": properties})
}