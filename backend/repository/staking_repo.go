package repository

import (
	"database/sql"

	"github.com/parametprame/abc/entity"
)

type StakingRepo interface {
	InsertEvent(event *entity.StakingEvent) error
	GetUserEvents(address string) ([]*entity.StakingEvent, error)
}

type stakingRepoSQLite struct {
	db *sql.DB
}

func NewStakingRepoSQLite(db *sql.DB) StakingRepo {
	return &stakingRepoSQLite{db: db}
}

func (r *stakingRepoSQLite) InsertEvent(e *entity.StakingEvent) error {
	_, err := r.db.Exec(`
        INSERT INTO staking_events (address, amount, block_number, tx_hash, event_type)
        VALUES (?, ?, ?, ?, ?)
    `, e.From, e.Amount, e.BlockNumber, e.TxHash, e.EventType)
	return err
}

func (r *stakingRepoSQLite) GetUserEvents(address string) ([]*entity.StakingEvent, error) {
	rows, err := r.db.Query(`
        SELECT id, address, amount, block_number, tx_hash, event_type, created_at
        FROM staking_events
        WHERE address = ?
        ORDER BY created_at DESC
    `, address)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*entity.StakingEvent
	for rows.Next() {
		var e entity.StakingEvent
		err := rows.Scan(&e.ID, &e.From, &e.Amount, &e.BlockNumber, &e.TxHash, &e.EventType, &e.CreatedAt)
		if err != nil {
			return nil, err
		}
		events = append(events, &e)
	}
	return events, nil
}
