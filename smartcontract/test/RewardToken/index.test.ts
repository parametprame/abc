import * as AddWhiteList from "./addWhiteList.test";
import * as RemoveWhiteList from "./removeWhiteList.test";
import * as Mint from "./mint.test";

export const run = async () => {
  describe("Reward Smart Contract", async function () {
    AddWhiteList.run();
    RemoveWhiteList.run();
    Mint.run();
  });
};
