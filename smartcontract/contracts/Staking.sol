// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRWDToken} from "./interfaces/IRWDToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStaking} from "./interfaces/IStaking.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
contract Staking is ReentrancyGuard, IStaking, Ownable {
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 nextBlockToClaimReward;
        uint256 rewardWatingUnlock;
    }

    IRWDToken public rwdToken;

    uint256 public RWD_PER_ETH_PER_DAY = 10e18; // 10 RWD token per day
    uint256 public BLOCKS_PER_DAY = 17280; // 1 day = 17,280 blocks (24 hours × 60 minutes × 60 seconds ÷ 5s per block)
    uint256 public BLOCKS_UNTIL_CLAIM_AVAILABLE = 12; // 1 hour = 720 blocks (5s per block)
    uint256 public constant ACC_REWARD_PRECISION = 1e12;

    uint256 public lastRewardBlock; /// Last block number that RWD distribution occurs.
    uint256 public accRwdPershare; //  Accumulated RWD per share
    uint256 public totalStaked; // Total ETH that staked

    mapping(address => UserInfo) public userInfo;

    constructor(address _rwdToken) Ownable(msg.sender) {
        rwdToken = IRWDToken(_rwdToken);
    }

    receive() external payable {
        _stake();
    }

    function stake() external payable {
        _stake();
    }

    function unstake(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        if (_amount > user.amount) {
            revert InvalidInput("User's balance is not enough");
        }

        update();

        uint256 accumulatedReward = (user.amount * accRwdPershare) /
            ACC_REWARD_PRECISION;
        uint256 pending = accumulatedReward - user.rewardDebt;

        if (user.nextBlockToClaimReward < block.number) {
            if (pending > 0) {
                rwdToken.mintToken(msg.sender, pending);
            }
        } else {
            user.rewardWatingUnlock += pending;
        }

        if (_amount > 0) {
            user.amount -= _amount;
            totalStaked -= _amount;

            (bool success, ) = msg.sender.call{value: _amount}("");
            if (!success) {
                revert TransferFailed();
            }
        }

        user.rewardDebt = (user.amount * accRwdPershare) / ACC_REWARD_PRECISION;

        emit UnStake(msg.sender, _amount);
    }

    function claim() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        update();

        uint256 accumulatedReward = (user.amount * accRwdPershare) /
            ACC_REWARD_PRECISION;

        uint256 pending = accumulatedReward - user.rewardDebt;
        uint256 cacheRewardWatingUnlock = user.rewardWatingUnlock;

        if (user.nextBlockToClaimReward > block.number) {
            revert ClaimNotAvailableYet();
        }

        if (cacheRewardWatingUnlock > 0) {
            rwdToken.mintToken(msg.sender, cacheRewardWatingUnlock);
            user.rewardWatingUnlock = 0;
        }

        if (pending > 0) {
            rwdToken.mintToken(msg.sender, pending);
        }

        user.rewardDebt = (user.amount * accRwdPershare) / ACC_REWARD_PRECISION;
        user.rewardWatingUnlock = 0;

        emit Claim(msg.sender, pending + cacheRewardWatingUnlock);
    }

    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];

        uint256 cacheAccRwdPershare = accRwdPershare;

        if (block.number > lastRewardBlock && totalStaked != 0) {
            uint256 blocksElapsed = block.number - lastRewardBlock;

            uint256 rewardPerBlock = (RWD_PER_ETH_PER_DAY * blocksElapsed) /
                BLOCKS_PER_DAY;

            cacheAccRwdPershare =
                accRwdPershare +
                ((rewardPerBlock * ACC_REWARD_PRECISION) / totalStaked);
        }

        uint256 accumulatedReward = (user.amount * cacheAccRwdPershare) /
            ACC_REWARD_PRECISION;

        uint256 pending = accumulatedReward - user.rewardDebt;
        uint256 totalPending = pending + user.rewardWatingUnlock;

        return totalPending;
    }

    function update() public {
        if (totalStaked == 0) {
            lastRewardBlock = block.number;
            return;
        }

        uint256 blocksElapsed = block.number - lastRewardBlock;

        uint256 rewardPerBlock = (RWD_PER_ETH_PER_DAY * blocksElapsed) /
            BLOCKS_PER_DAY;

        accRwdPershare += (rewardPerBlock * ACC_REWARD_PRECISION) / totalStaked;

        lastRewardBlock = block.number;
    }

    function _stake() internal nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        if (msg.value == 0) {
            revert InvalidInput("Must stake more than 0 ETH");
        }

        update();

        if (user.amount > 0) {
            uint256 accumulatedReward = (user.amount * accRwdPershare) /
                ACC_REWARD_PRECISION;

            uint256 pending = accumulatedReward - user.rewardDebt;

            if (block.number >= user.nextBlockToClaimReward) {
                if (pending > 0) {
                    rwdToken.mintToken(msg.sender, pending);
                }
            } else {
                user.rewardWatingUnlock += pending;
            }
        }

        if (msg.value > 0) {
            user.amount += msg.value;
            totalStaked += msg.value;
        }

        user.nextBlockToClaimReward =
            block.number +
            BLOCKS_UNTIL_CLAIM_AVAILABLE;

        user.rewardDebt = (user.amount * accRwdPershare) / ACC_REWARD_PRECISION;

        emit Stake(msg.sender, msg.value);
    }

    //Admin function

    function setRewardPerday(uint256 _amount) external onlyOwner {
        RWD_PER_ETH_PER_DAY = _amount;
    }

    function setBlockPerday(uint256 _amount) external onlyOwner {
        BLOCKS_PER_DAY = _amount;
    }

    function setBlockUtilClaimAvailable(uint256 _amount) external onlyOwner {
        BLOCKS_UNTIL_CLAIM_AVAILABLE = _amount;
    }

    function setRewardToken(IRWDToken _address) external onlyOwner {
        rwdToken = _address;
    }
}
