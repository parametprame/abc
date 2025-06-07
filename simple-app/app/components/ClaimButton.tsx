import { useWriteContract } from "wagmi";
import STAKE_ABI from "../abis/stake.abi.json";

export const ClaimButton = () => {
  const { isPending, writeContract } = useWriteContract();

  const handleClaimToken = () => {
    writeContract({
      address: `0x${process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS}`,
      abi: STAKE_ABI,
      functionName: "claim",
      args: [],
    });
  };
  return (
    <button
      type="button"
      className="text-white bg-amber-500 hover:bg-amber-600 font-bold text-base px-5 py-3.5 rounded-2xl"
      onClick={handleClaimToken}
      disabled={isPending}
    >
      Claim
    </button>
  );
};
