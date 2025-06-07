import { deployStaking } from "./deploy.test";
import { expect } from "chai";
import { constants } from "../constant";

export const run = async () => {
  const { MOCK_ADDRESS, ONE_ETH } = constants;

  describe("admin functionality", async function () {
    it("[SUCCESS] should allow the owner to change reward per day", async () => {
      const { staking } = await deployStaking();

      await staking.getFunction("setRewardPerday")(ONE_ETH);
      expect(await staking.RWD_PER_ETH_PER_DAY()).to.be.equal(ONE_ETH);
    });

    it("[SUCCESS] should allow the owner to change block per day", async () => {
      const { staking } = await deployStaking();

      await staking.getFunction("setBlockPerday")(1);
      expect(await staking.BLOCKS_PER_DAY()).to.be.equal(1);
    });

    it("[SUCCESS] should allow the owner to change block util claim available", async () => {
      const { staking } = await deployStaking();

      await staking.getFunction("setBlockUtilClaimAvailable")(1);
      expect(await staking.BLOCKS_UNTIL_CLAIM_AVAILABLE()).to.be.equal(1);
    });

    it("[SUCCESS] should allow the owner to change reward token address", async () => {
      const { staking } = await deployStaking();

      await staking.getFunction("setRewardToken")(MOCK_ADDRESS);
      expect(await staking.rwdToken()).to.be.equal(MOCK_ADDRESS);
    });

    it("[FAILED] shouldn't allow the non-owner to change reward per day", async () => {
      const { staking, mock1 } = await deployStaking();
      await expect(
        staking.connect(mock1).getFunction("setRewardPerday")(ONE_ETH)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("[FAILED] shouldn't allow the non-owner to change block per day", async () => {
      const { staking, mock1 } = await deployStaking();
      await expect(
        staking.connect(mock1).getFunction("setBlockPerday")(1)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("[FAILED] shouldn't allow the non-owner to change block util claim available", async () => {
      const { staking, mock1 } = await deployStaking();
      await expect(
        staking.connect(mock1).getFunction("setBlockUtilClaimAvailable")(1)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("[FAILED] shouldn't allow the non-owner to change block util claim available", async () => {
      const { staking, mock1 } = await deployStaking();
      await expect(
        staking.connect(mock1).getFunction("setRewardToken")(MOCK_ADDRESS)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });
  });
};
