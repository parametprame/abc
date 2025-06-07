"use client";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBlockNumber, useReadContracts } from "wagmi";
import STAKE_ABI from "./abis/stake.abi.json";
import { useEffect, useState } from "react";
import { StakeButton } from "./components/StakeButton";
import { formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { UnStakeButton } from "./components/UnStakeButton";
import { ClaimButton } from "./components/ClaimButton";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [value, setValue] = useState<number | "">("");
  const queryClient = useQueryClient();

  const { data, isPending } = useReadContracts({
    contracts: [
      {
        address: `0x${process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}`,
        functionName: "totalStaked",
        abi: STAKE_ABI,
        args: [],
      },
      {
        address: `0x${process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}`,
        functionName: "pendingReward",
        abi: STAKE_ABI,
        args: [address],
      },
    ],
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    queryClient.invalidateQueries({ refetchType: "active", type: "active" });
  }, [blockNumber, queryClient]);

  if (isPending) return <div>Loading...</div>;

  const [totalStaked, pendingReward] = data || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (e.target.value === "" || (!isNaN(num) && num >= 0)) {
      setValue(e.target.value === "" ? "" : num);
    }
  };

  return (
    <div className="h-full flex justify-center items-center">
      <div className="block md:min-w-[512px] max-w-lg bg-black rounded-2xl shadow-md py-6 px-4 mt-10">
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex flex-col  md:flex-row justify-center items-center md:items-start">
            <div className="flex flex-col justify-between md:ml-4 ml-0 md:mt-0 mt-3 items-center md:items-start">
              <div className="px-8 md:px-5 py-2 text-lg font-bold bg-transparent rounded-2xl border border-white text-white  break-words flex items-center">
                <div>Stake ETH to earn reward tokens</div>
              </div>

              <div className="mt-10 py-1 px-1.5 text-base font-semibold bg-white rounded-lg text-white flex justify-between w-full">
                <p className="text-black">Total ETH Staked</p>
                <div className="flex ">
                  <p className="text-black">
                    {totalStaked?.result
                      ? formatEther(BigInt(totalStaked!.result.toString()))
                      : 0}
                  </p>
                  <p className="ml-1 text-black">ETH</p>
                </div>
              </div>

              <p className="text-sm font-medium mt-4 text-white pl-2 mb-2">
                Reward Tokens Earned
              </p>
              <div className="pl-2 text-base font-semibold bg-white rounded-2xl text-black flex justify-between items-center w-full">
                <div className="inline-flex items-center">
                  <p>
                    {pendingReward!.result
                      ? formatEther(BigInt(pendingReward!.result.toString()))
                      : 0}
                  </p>
                </div>
                <ClaimButton />
              </div>
              <input
                type="number"
                id="positive-number"
                className="my-3 w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-white"
                min="0"
                placeholder="1"
                value={value}
                onChange={handleChange}
              />
            </div>
          </div>
          <div></div>
          <div className="flex flex-col md:flex-row justify-center mt-5 md:mt-0 space-y-2 md:space-y-0 md:space-x-4 ">
            {!isConnected && <WalletButton wallet="metamask" />}
            {isConnected && (
              <>
                <StakeButton value={value} />
                <UnStakeButton value={value} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
