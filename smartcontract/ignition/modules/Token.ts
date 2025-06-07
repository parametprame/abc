import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const token = m.contract("RWDToken");

  return { token };
});

export default DeployModule;
