// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStaking {
    error InvalidInput(string message);
    error ClaimNotAvailableYet();
    error TransferFailed();

    event Stake(address indexed user, uint256 amount);
    event UnStake(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount);

    function stake() external payable;
    function unstake(uint256 _amount) external;
    function claim() external;
    function pendingReward(address _user) external view returns (uint256);
}
