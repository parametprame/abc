import { ethers } from "ethers";
import axios from "axios";
import * as dotenv from "dotenv";
import STAKE_ABI from "./stake.abi.json";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractAddress = process.env.STAKING_ADDRESS!;
const apiEndpoint = process.env.API_ENDPOINT!;

const contract = new ethers.Contract(contractAddress, STAKE_ABI, provider);

async function main() {
  contract.on("Stake", async (user: string, amount: bigint, event) => {
    const payload = {
      from: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
      txHash: event.log.transactionHash,
      eventType: "Stake",
    };

    console.log("Event received: Stake", payload);

    try {
      const res = await axios.post(apiEndpoint, payload);
      console.log("Sent to API:", res.status);
    } catch (err) {
      console.error("Error sending to API:", err);
    }
  });

  contract.on("UnStake", async (user: string, amount: bigint, event) => {
    const payload = {
      from: user,
      amount: amount.toString(),
      blockNumber: event.log.blockNumber,
      txHash: event.log.transactionHash,
      eventType: "UnStake",
    };

    console.log("Event received: Unstake", payload);

    try {
      const res = await axios.post(apiEndpoint, payload);
      console.log("Sent to API:", res.status);
    } catch (err) {
      console.error("Error sending to API:", err);
    }
  });
}

main().catch((e) => {
  console.error("Listener failed:", e);
});
