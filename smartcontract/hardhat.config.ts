import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "solidity-coverage";
import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    dev: {
      url: "http://127.0.0.1:8545",
      chainId: 123456765432,
      accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
    },
  },
};

export default config;
