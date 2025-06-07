package entity

type StakingEvent struct {
	ID          int64  `json:"id,omitempty"`
	From        string `json:"from"`
	Amount      string `json:"amount"`
	BlockNumber uint64 `json:"blockNumber"`
	TxHash      string `json:"txHash"`
	EventType   string `json:"eventType"`
	CreatedAt   string `json:"createdAt,omitempty"`
}

type UserStaking struct {
	Address string `json:"address"`
	Staked  string `json:"staked"`
}
