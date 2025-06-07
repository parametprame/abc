package usecase

import (
	"math/big"

	"github.com/parametprame/abc/entity"
	"github.com/parametprame/abc/repository"
)

type stakingUsecase struct {
	repo repository.StakingRepo
}

func NewStakingUsecase(repo repository.StakingRepo) StakingUsecase {
	return &stakingUsecase{repo: repo}
}

func (u *stakingUsecase) GetUserStaking(address string) (*entity.UserStaking, error) {
	events, err := u.repo.GetUserEvents(address)
	if err != nil {
		return nil, err
	}
	staked := big.NewInt(0)
	for _, e := range events {
		amt, _ := new(big.Int).SetString(e.Amount, 10)
		switch e.EventType {
		case "Stake":
			staked.Add(staked, amt)
		case "UnStake":
			staked.Sub(staked, amt)
		}
	}
	return &entity.UserStaking{
		Address: address,
		Staked:  staked.String(),
	}, nil
}

func (u *stakingUsecase) HandleEvent(event *entity.StakingEvent) error {
	return u.repo.InsertEvent(event)
}
