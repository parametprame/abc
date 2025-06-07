import { deployStaking } from "./deploy.test";
import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "../constant";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

export const run = async () => {
  const {
    BLOCKS_UNTIL_CLAIM_AVAILABLE,
    ONE_ETH,
    TWO_ETH,
    AMOUNT_REWARD_PER_BLOCK,
  } = constants;

  describe("stake functionality", async function () {
    it("[SUCCESS] should allow the user to stake ETH using the call function", async () => {
      const { mock1, staking } = await deployStaking();

      const tx = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      const info = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const nextBlockToClaimReward =
        (await ethers.provider.getBlockNumber()) + BLOCKS_UNTIL_CLAIM_AVAILABLE;

      expect(await ethers.provider.getBalance(staking.getAddress())).to.equal(
        ONE_ETH
      );
      expect(info[0]).to.equal(ONE_ETH);
      expect(info[2]).to.equal(nextBlockToClaimReward);
      expect(await staking.getFunction("totalStaked")()).to.equal(ONE_ETH);

      await expect(tx)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should handle case when user.nextBlockToClaimReward > current block", async () => {
      const { mock1, staking } = await deployStaking();

      const tx1 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      const before = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const tx2 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      const after = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      expect(before[1]).to.equal(0);
      expect(before[2]).to.lt(after[2]);
      expect(after[0]).to.eq(TWO_ETH);
      await expect(tx1)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
      await expect(tx2)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should call receive() and stake ETH when sent directly", async () => {
      const { mock1, staking } = await deployStaking();

      const tx = await mock1.sendTransaction({
        to: staking.getAddress(),
        value: ONE_ETH,
      });

      const info = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      const nextBlockToClaimReward =
        (await ethers.provider.getBlockNumber()) + BLOCKS_UNTIL_CLAIM_AVAILABLE;

      expect(await ethers.provider.getBalance(staking.getAddress())).to.equal(
        ONE_ETH
      );

      expect(info[0]).to.equal(ONE_ETH);
      expect(info[2]).to.equal(nextBlockToClaimReward);
      expect(await staking.getFunction("totalStaked")()).to.equal(ONE_ETH);
      await expect(tx)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should allow the user to re-stake ETH and receive a reward after 1 hour of staking", async () => {
      const { mock1, staking, token } = await deployStaking();

      const tx1 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE);

      const pendingReward = await staking.getFunction("pendingReward")(
        mock1.address
      );
      const blockNumBeforeStaking = await ethers.provider.getBlockNumber();

      const tx2 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      }); // stake at block 731

      const blockNumAfterStaking = await ethers.provider.getBlockNumber();

      const balance =
        pendingReward +
        BigInt(
          (blockNumAfterStaking - blockNumBeforeStaking) *
            AMOUNT_REWARD_PER_BLOCK
        );

      expect(await staking.getFunction("totalStaked")()).to.equal(TWO_ETH);
      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(
        balance
      );
      await expect(tx1)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
      await expect(tx2)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[SUCCESS] should allow the user to re-stake ETH and shouldn't receive a reward if staking less than 1 hour", async () => {
      const { mock1, staking, token } = await deployStaking();

      const tx1 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      await mine(BLOCKS_UNTIL_CLAIM_AVAILABLE - 5);

      const tx2 = await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });

      const nextBlockToClaimReward =
        (await ethers.provider.getBlockNumber()) + BLOCKS_UNTIL_CLAIM_AVAILABLE;

      const info = await staking.connect(mock1).getFunction("userInfo")(
        mock1.address
      );

      expect(await staking.getFunction("totalStaked")()).to.equal(TWO_ETH);
      expect(await token.getFunction("balanceOf")(mock1.address)).to.equal(0);
      expect(info[0]).to.equal(TWO_ETH);
      expect(info[2]).to.equal(nextBlockToClaimReward);
      await expect(tx1)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
      await expect(tx2)
        .to.emit(staking, "Stake")
        .withArgs(mock1.address, ONE_ETH);
    });

    it("[FAILED] shouldn't allow the user to stake ETH if they send 0 ETH to the contract", async () => {
      const { mock1, staking } = await deployStaking();

      await expect(
        staking.connect(mock1).getFunction("stake")({
          value: 0,
        })
      )
        .to.be.revertedWithCustomError(staking, "InvalidInput")
        .withArgs("Must stake more than 0 ETH");
    });

    it("[FAILED] shouldn't allow the user call receive() function if they send 0 ETH to the contract", async () => {
      const { mock1, staking } = await deployStaking();

      await expect(
        mock1.sendTransaction({
          to: staking.getAddress(),
          value: 0,
        })
      ).to.be.revertedWithCustomError(staking, "InvalidInput");
    });
  });
};
