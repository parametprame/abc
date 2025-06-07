import { deployStaking } from "./deploy.test";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { constants } from "../constant";

export const run = async () => {
  const {
    BLOCKS_UNTIL_CLAIM_AVAILABLE,
    ONE_ETH,
    TWO_ETH,
    BLOCKS_IN_ONE_DAY,
    AMOUNT_REWARD_PER_BLOCK,
  } = constants;

  describe("claim functionality", async function () {
    it("[SUCCESS] should allow the user to claim reward", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE - 1);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );
      const blockNumBeforeClaim = await ethers.provider.getBlockNumber();

      const tx = await staking.connect(mock1).getFunction("claim")();

      const blockNumAfterClaim = await ethers.provider.getBlockNumber();

      console.log(await token.getFunction("balanceOf")(mock1.address));

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterClaim - blockNumBeforeClaim) * AMOUNT_REWARD_PER_BLOCK
        );

      const user = await staking.getFunction("userInfo")(mock1.address);

      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );
      expect(user[1]).to.equal(balance);
      await expect(tx)
        .to.emit(staking, "Claim")
        .withArgs(mock1.address, balance);
    });

    it("[SUCCESS] should allow the user to claim pending reward and normal reward", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await staking.connect(mock1).getFunction("unstake")(ONE_ETH);

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      const blockNumBeforeClaim = await ethers.provider.getBlockNumber();

      const tx = await staking.connect(mock1).getFunction("claim")();

      const user = await staking.getFunction("userInfo")(mock1.address);

      const blockNumAfterClaim = await ethers.provider.getBlockNumber();

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterClaim - blockNumBeforeClaim) * AMOUNT_REWARD_PER_BLOCK
        );

      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );

      expect(user[3]).to.equal(0);
      expect(
        await staking.getFunction("pendingReward")(mock1.address)
      ).to.equal(0);
      await expect(tx)
        .to.emit(staking, "Claim")
        .withArgs(mock1.address, balance);
    });

    it("[SUCCESS] should allow the user to claim pending reward", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });
      await staking.connect(mock1).getFunction("unstake")(ONE_ETH);

      const beforePendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const tx = await staking.connect(mock1).getFunction("claim")();

      const user = await staking.getFunction("userInfo")(mock1.address);

      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        beforePendingReward
      );

      expect(user[1]).to.equal(0);
      expect(user[3]).to.equal(0);
      expect(
        await staking.getFunction("pendingReward")(mock1.address)
      ).to.equal(0);
      await expect(tx)
        .to.emit(staking, "Claim")
        .withArgs(mock1.address, beforePendingReward);
    });

    it("[SUCCESS] should allow the user to claim 10 tokens as a reward if they staked for one day.", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_IN_ONE_DAY - 1);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );
      const blockNumBeforeClaim = await ethers.provider.getBlockNumber();

      const tx = await staking.connect(mock1).getFunction("claim")();

      const blockNumAfterClaim = await ethers.provider.getBlockNumber();

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterClaim - blockNumBeforeClaim) * AMOUNT_REWARD_PER_BLOCK
        );

      const user = await staking.getFunction("userInfo")(mock1.address);

      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );
      expect(user[1]).to.equal(balance);
      await expect(tx)
        .to.emit(staking, "Claim")
        .withArgs(mock1.address, balance);
    });

    it("[SUCCESS] should distribute rewards proportionally to the user's staked ETH.", async () => {
      const { mock1, mock2, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });
      await staking.connect(mock2).getFunction("stake")({
        value: TWO_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const before1 = await token.balanceOf(mock1.address);
      const before2 = await token.balanceOf(mock2.address);

      await staking.connect(mock1).getFunction("claim")();
      await staking.connect(mock2).getFunction("claim")();

      const after1 = await token.balanceOf(mock1.address);
      const after2 = await token.balanceOf(mock2.address);

      const reward1 = after1 - before1;
      const reward2 = after2 - before2;

      const ratio = Math.floor(
        (Number(reward2.toString()) * 100) / Number(reward1.toString())
      );

      expect(ratio).to.be.closeTo(200, 1);
    });

    it("[FAILED] shouldn't allow the user to claim reward if staking less than 1 hour", async () => {
      const { mock1, staking } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE - 2);

      await expect(
        staking.connect(mock1).getFunction("claim")()
      ).to.be.revertedWithCustomError(staking, "ClaimNotAvailableYet");
    });
  });
};
