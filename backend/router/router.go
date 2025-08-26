package router

import (
	"flexliving-reviews/handlers"
	"flexliving-reviews/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	reviewService := services.NewReviewService()
	reviewHandler := handlers.NewReviewHandler(reviewService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://frontend-production-e8e5.up.railway.app", "https://*.railway.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/reviews/hostaway", reviewHandler.GetReviews)
		api.PATCH("/reviews/:id/approve", reviewHandler.ApproveReview)
		api.GET("/properties", reviewHandler.GetProperties)
	}

	return r
}