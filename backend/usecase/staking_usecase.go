package usecase

import "github.com/parametprame/abc/entity"

type StakingUsecase interface {
	GetUserStaking(address string) (*entity.UserStaking, error)
	HandleEvent(event *entity.StakingEvent) error
}
