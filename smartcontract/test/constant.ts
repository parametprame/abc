import { ethers } from "hardhat";

export const constants = {
  HALF_ETH: ethers.parseEther("0.5"),
  ONE_ETH: ethers.parseEther("1"),
  TWO_ETH: ethers.parseEther("2"),
  BLOCKS_UNTIL_CLAIM_AVAILABLE: 720,
  BLOCKS_IN_ONE_DAY: 17280,
  MOCK_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  AMOUNT_REWARD_PER_BLOCK: 578703704000000,
};
