import { useWriteContract } from "wagmi";
import STAKE_ABI from "../abis/stake.abi.json";
import { parseEther } from "viem";

interface Props {
  value: number | "";
}

export const UnStakeButton = ({ value }: Props) => {
  const { isPending, writeContract } = useWriteContract();

  const handleUnStake = () => {
    writeContract({
      address: `0x${process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}`,
      abi: STAKE_ABI,
      functionName: "unstake",
      args: [value.toString() == "" ? 0 : parseEther(value.toString())],
    });
  };

  return (
    <>
      <button
        type="button"
        className="text-white text-xl font-semibold bg-amber-500 hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 dark:focus:ring-amber-800 px-20 py-2 text-center rounded-full"
        onClick={handleUnStake}
        disabled={isPending}
      >
        Unstake
      </button>
    </>
  );
};
