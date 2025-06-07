// contracts/RevertingReceiver.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../interfaces/IStaking.sol";

contract RevertingReceiver {
    IStaking public stakingContract;

    constructor(address _stakingContract) {
        stakingContract = IStaking(_stakingContract);
    }

    function stakeIntoContract() external payable {
        stakingContract.stake{value: msg.value}();
    }

    function unstakeFromContract(uint256 amount) external {
        stakingContract.unstake(amount);
    }
    receive() external payable {
        revert("Can't receive ETH");
    }
}
