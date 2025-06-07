import { ethers } from "ethers";
import * as dotenv from "dotenv";
import TOKEN_ABI from "./token.abi.json";

dotenv.config();

const tokenAddress = process.env.TOKEN_ADDRESS!;
const stakingAddress = process.env.STAKING_ADDRESS!;
const privateKey = process.env.PRIVATE_KEY!;

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(privateKey, provider);

  const token = new ethers.Contract(tokenAddress, TOKEN_ABI as any, signer);
  const transaction = await token.setWhitelist(stakingAddress);

  await transaction.wait();
}

main().catch((e) => {
  console.error("Error:", e);
});
