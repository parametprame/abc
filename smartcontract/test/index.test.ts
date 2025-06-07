import * as StakingContract from "./Staking/index.test";
import * as RewardContract from "./RewardToken/index.test";

describe("Unit Test Smart Contract", async function () {
  StakingContract.run();
  RewardContract.run();
});
