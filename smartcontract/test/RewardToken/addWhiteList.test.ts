import { deployToken } from "./deploy.test";
import { ethers } from "hardhat";
import { expect } from "chai";

export const run = async () => {
  describe("Add Whitelist", async function () {
    it("[SUCCESS] should allow the owner to add addresses to the whitelist", async () => {
      const { token, mock1 } = await deployToken();
      await token.setWhitelist(mock1.address);
      expect(await token.whitelist(mock1.address)).to.be.true;
    });

    it("[FAILED] shouldn't allow the non-owner to add addresses to the whitelist", async () => {
      const { token, mock1, mock2 } = await deployToken();
      await expect(
        token.connect(mock1).getFunction("setWhitelist")(mock2.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });
};
