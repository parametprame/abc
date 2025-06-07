import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const rwdToken = m.getParameter(
    "_rwdToken",
    "0x1De26d03185143144D7eB95a1802f9A5A4673183"
  );

  const staking = m.contract("Staking", [rwdToken]);

  return { staking };
});

export default DeployModule;
