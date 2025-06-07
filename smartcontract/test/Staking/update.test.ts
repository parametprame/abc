import { deployStaking } from "./deploy.test";
import { expect } from "chai";
import { ethers } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { constants } from "../constant";

export const run = async () => {
  const { ONE_ETH } = constants;

  describe("update functionality", async function () {
    it("[SUCCESS] should update lastRewardBlock but not accRwdPershare if totalStaked == 0", async () => {
      const { staking } = await deployStaking();

      await mine(5);

      await staking.update();

      const lastRewardBlock = await staking.lastRewardBlock();
      const currentBlock = await ethers.provider.getBlockNumber();
      const accRwdPershare = await staking.accRwdPershare();

      expect(lastRewardBlock).to.equal(currentBlock);
      expect(accRwdPershare).to.equal(0);
    });

    it("[SUCCESS] should calculate rewards correctly when totalStaked > 0", async () => {
      const { staking, mock1 } = await deployStaking();

      await staking.connect(mock1).getFunction("stake")({
        value: ONE_ETH,
      });
      await staking.update();

      await mine(10);

      await staking.update();

      const accRwdPershare = await staking.accRwdPershare();
      expect(accRwdPershare).to.be.gt(0);

      const lastRewardBlock = await staking.lastRewardBlock();
      const currentBlock = await ethers.provider.getBlockNumber();
      expect(lastRewardBlock).to.equal(currentBlock);
    });
  });
};
