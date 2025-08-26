package main

import (
	"log"
	"os"

	"flexliving-reviews/router"
)

func main() {
	r := router.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s", port)
	r.Run(":" + port)
}