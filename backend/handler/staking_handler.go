package handler

import (
	"net/http"

	"github.com/parametprame/abc/entity"
	"github.com/parametprame/abc/usecase"

	"github.com/gin-gonic/gin"
)

func RegisterStakingRoutes(r *gin.Engine, uc usecase.StakingUsecase) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/staking/:address", func(c *gin.Context) {
		address := c.Param("address")
		staking, err := uc.GetUserStaking(address)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, staking)
	})

	r.POST("/webhook/events", func(c *gin.Context) {
		var payload entity.StakingEvent

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := uc.HandleEvent(&payload); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "received"})
	})
}
