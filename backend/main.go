package main

import (
	"github.com/parametprame/abc/database"
	"github.com/parametprame/abc/handler"
	"github.com/parametprame/abc/repository"
	"github.com/parametprame/abc/usecase"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	db := database.NewDB()
	repo := repository.NewStakingRepoSQLite(db)
	uc := usecase.NewStakingUsecase(repo)

	handler.RegisterStakingRoutes(r, uc)

	r.Run(":8080")
}
