import { deployToken } from "./deploy.test";
import { ethers } from "hardhat";
import { expect } from "chai";

export const run = async () => {
  describe("Remove Whitelist", async function () {
    it("[SUCCESS] should allow the owner to remove addresses from the whitelist", async () => {
      const { token, mock1 } = await deployToken();
      await token.setWhitelist(mock1.address);
      expect(await token.whitelist(mock1.address)).to.be.true;

      await token.revokeWhitelist(mock1.address);
      expect(await token.whitelist(mock1.address)).to.be.false;
    });

    it("[FAILED] shouldn't allow the non-owner to remove addresses from the whitelist", async () => {
      const { token, mock1, mock2 } = await deployToken();
      await expect(
        token.connect(mock1).getFunction("revokeWhitelist")(mock2.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });
};
