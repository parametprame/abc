import { deployStaking } from "./deploy.test";
import { expect } from "chai";
import { ethers } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { constants } from "../constant";

export const run = async () => {
  const {
    BLOCKS_UNTIL_CLAIM_AVAILABLE,
    ONE_ETH,
    TWO_ETH,
    AMOUNT_REWARD_PER_BLOCK,
    HALF_ETH,
  } = constants;

  describe("unstake functionality", async function () {
    it("[SUCCESS] should allow the user to un-stake all ETH and receive reward token", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      const blockNumBeforeUnStaked = await ethers.provider.getBlockNumber();

      const tx = await staking.connect(mock1).getFunction("unstake")(ONE_ETH);

      const blockNumAfterUnStaked = await ethers.provider.getBlockNumber();

      const user = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const afterPendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterUnStaked - blockNumBeforeUnStaked) *
            AMOUNT_REWARD_PER_BLOCK
        );

      expect(await staking.getFunction("totalStaked")()).to.equal(0);
      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );
      expect(user[0]).to.equal(0);
      expect(user[1]).to.equal(afterPendingReward);
      await expect(tx)
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, ONE_ETH);
      await expect;
    });

    it("[SUCCESS] should handle if user unstake before 1 hr `user.nextBlockToClaimReward > current block`", async () => {
      const { mock1, staking } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });
      const tx = await staking.connect(mock1).getFunction("unstake")(ONE_ETH);
      const user = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const pendingReward = await staking
        .connect(mock1)
        .getFunction("pendingReward")(mock1.address);

      expect(user[3]).to.equal(pendingReward);
      expect(user[0]).to.equal(0);
      await expect(tx)
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should handle if user unstake before 1 hr `user.nextBlockToClaimReward > current block (mine 20 blocks)`", async () => {
      const { mock1, staking } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });
      const tx = await staking.connect(mock1).getFunction("unstake")(ONE_ETH);

      mine(199);

      const user = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const pendingReward = await staking
        .connect(mock1)
        .getFunction("pendingReward")(mock1.address);

      expect(user[3]).to.equal(pendingReward);
      expect(user[0]).to.equal(0);
      await expect(tx)
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should allow the user to un-stake 50% of ETH and receive reward token", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      const blockNumBeforeUnStaked = await ethers.provider.getBlockNumber();

      const tx = await staking.connect(mock1).getFunction("unstake")(HALF_ETH);

      const blockNumAfterUnStaked = await ethers.provider.getBlockNumber();

      const user = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const afterPendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterUnStaked - blockNumBeforeUnStaked) *
            AMOUNT_REWARD_PER_BLOCK
        );

      expect(await staking.getFunction("totalStaked")()).to.equal(HALF_ETH);
      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );
      expect(user[0]).to.equal(HALF_ETH);
      expect(afterPendingReward).to.equal(0);
      await expect(tx)
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, HALF_ETH);
    });

    it("[SUCCESS] shouldn't transfer if amount == 0.", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await expect(staking.connect(mock1).getFunction("unstake")(0))
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, 0);

      expect(await token.balanceOf(mock1.address)).to.equal(0);

      const userInfo = await staking.getFunction("userInfo")(mock1.address);
      expect(userInfo.amount).to.equal(ONE_ETH);
    });

    it("[SUCCESS] should allow the user to un-stake all ETH  and shouldn't receive a reward if staking less than 1 hour", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(1);

      const tx = await staking.connect(mock1).getFunction("unstake")(ONE_ETH);

      const user = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      expect(await staking.getFunction("totalStaked")()).to.equal(0);
      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(0);
      expect(user[0]).to.equal(0);
      expect(user[1]).to.equal(0);
      await expect(tx)
        .to.emit(staking, "UnStake")
        .withArgs(mock1.address, ONE_ETH);
      await expect;
    });

    it("[FAILED] should revert with TransferFailed if ETH transfer fails during unstake.", async () => {
      const { mock1, staking, token } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await expect(
        staking.connect(mock1).getFunction("unstake")(TWO_ETH)
      ).to.be.revertedWithCustomError(staking, "InvalidInput");
    });

    it("[FAILED] shouldn't allow the user to unstake more ETH than their staked balance in the contract.", async () => {
      const { mock1, staking } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await expect(
        staking.connect(mock1).getFunction("unstake")(TWO_ETH)
      ).to.be.revertedWithCustomError(staking, "InvalidInput");
    });

    it("[FAILED] should revert with TransferFailed if ETH transfer fails on unstake.", async () => {
      const { mock1, staking, mockContract } = await deployStaking();

      await mockContract.connect(mock1).getFunction("stakeIntoContract")({
        value: ONE_ETH,
      });

      await expect(
        mockContract.connect(mock1).getFunction("unstakeFromContract")(ONE_ETH)
      ).to.be.revertedWithCustomError(staking, "TransferFailed");
    });
  });
};
