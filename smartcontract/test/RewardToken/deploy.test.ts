import { ethers } from "hardhat";

export const deployToken = async () => {
  const [owner, mock1, mock2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("RWDToken");
  const token = await Token.connect(owner).deploy();

  return {
    owner,
    mock1,
    mock2,
    token,
  };
};
