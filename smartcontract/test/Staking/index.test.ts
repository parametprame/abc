import * as Stake from "./stake.test";
import * as Admin from "./admin.test";
import * as Update from "./update.test";
import * as Claim from "./claim.test";
import * as Unstake from "./unstake.test";

export const run = async () => {
  describe("Staking Smart Contract", async function () {
    Stake.run();
    Claim.run();
    Unstake.run();
    Admin.run();
    Update.run();
  });
};
