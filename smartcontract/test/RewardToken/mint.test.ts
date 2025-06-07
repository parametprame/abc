import { deployToken } from "./deploy.test";
import { ethers } from "hardhat";
import { expect } from "chai";

export const run = async () => {
  describe("Mint Token", async function () {
    it("[SUCCESS] should allow the owner mint the token to destination address", async () => {
      const { token, mock1 } = await deployToken();
      const amount = ethers.parseEther("1");

      await token.mintToken(mock1.address, ethers.parseEther("1"));
      expect(await token.balanceOf(mock1.address)).to.equal(amount);
    });

    it("[SUCCESS] should allow the whitelist address mint the token to destination address", async () => {
      const { token, mock1, mock2 } = await deployToken();

      await token.setWhitelist(mock1.address);
      const amount = ethers.parseEther("1");

      await token.connect(mock1).getFunction("mintToken")(
        mock2.address,
        amount
      );

      expect(await token.balanceOf(mock2.address)).to.equal(amount);
    });

    it("[FAILED] shouldn't allow the whitelist address mint the token to destination address", async () => {
      const { token, mock1, mock2 } = await deployToken();
      const amount = ethers.parseEther("1");

      await expect(
        token.connect(mock1).getFunction("mintToken")(mock2.address, amount)
      ).to.be.revertedWith("You are not the owner or whitelisted.");
    });
  });
};
