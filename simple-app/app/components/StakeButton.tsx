import { useWriteContract } from "wagmi";
import STAKE_ABI from "../abis/stake.abi.json";
import { parseEther } from "viem";

interface Props {
  value: number | "";
}

export const StakeButton = ({ value }: Props) => {
  const { writeContract, isPending } = useWriteContract();

  const handleStake = () => {
    writeContract({
      address: `0x${process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}`,
      abi: STAKE_ABI,
      functionName: "stake",
      value: parseEther(value.toString()),
    });
  };

  return (
    <button
      type="button"
      className="text-white text-xl font-semibold bg-[#408DE6] hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 px-20 py-2 text-center rounded-full"
      onClick={handleStake}
      disabled={isPending}
    >
      Stake
    </button>
  );
};
