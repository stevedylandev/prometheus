import { porto } from "porto/wagmi";
import { createConfig, http } from "wagmi";
import { baseSepolia, mainnet } from "wagmi/chains";

export const config = createConfig({
	chains: [baseSepolia, mainnet],
	connectors: [porto()],
	multiInjectedProviderDiscovery: false,
	transports: {
		[baseSepolia.id]: http(),
		[mainnet.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
