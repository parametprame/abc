import { ethers } from "hardhat";

export const deployStaking = async () => {
  const [owner, mock1, mock2] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("RWDToken");
  const token = await Token.connect(owner).deploy();

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.connect(owner).deploy(token.getAddress());

  const MockContract = await ethers.getContractFactory("RevertingReceiver");
  const mockContract = await MockContract.connect(owner).deploy(
    staking.getAddress()
  );

  await token.connect(owner).getFunction("setWhitelist")(staking.getAddress());

  return {
    owner,
    mock1,
    mock2,
    token,
    staking,
    mockContract,
  };
};
