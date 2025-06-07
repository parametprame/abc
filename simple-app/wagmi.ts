import { getDefaultConfig, Chain } from "@rainbow-me/rainbowkit";

const dev = {
  id: 123456765432,
  name: "Dev",
  iconBackground: "#fff",
  nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: "App demo",
  projectId: "YOUR_PROJECT_ID",
  chains: [dev],
  ssr: true,
});
