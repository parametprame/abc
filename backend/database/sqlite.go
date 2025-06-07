package database

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func NewDB() *sql.DB {
	db, err := sql.Open("sqlite3", "./staking.db")
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}

	if _, err := db.Exec(`
    CREATE TABLE IF NOT EXISTS staking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT,
        amount TEXT,
        block_number INTEGER,
        tx_hash TEXT,
        event_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`); err != nil {
		log.Fatal("Failed to create table:", err)
	}

	return db
}
