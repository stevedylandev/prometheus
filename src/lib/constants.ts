import type { Address } from "ox";
import { Chains } from "porto";

const exp1Address = "0x29F45fc3eD1d0ffaFb5e2af9Cc6C3AB1555cd5a2";
const exp2Address = "0x62a9d6DE963a5590f6fbA5119e937F167677bfE7";

export const CORS_DESTROYER_URL = "https://cors.porto.workers.dev";

// export function urlWithCorsBypass(url: string) {
// 	return `${CORS_DESTROYER_URL}?url=${url}`;
// }

export const ethAsset = {
	address: "0x0000000000000000000000000000000000000000",
	decimals: 18,
	logo: "/icons/eth.svg",
	name: "Ethereum",
	symbol: "ETH",
} as const;

export const defaultAssets: Record<
	84532,
	ReadonlyArray<{
		name: string;
		logo: string;
		symbol: string;
		decimals: number;
		address: Address.Address;
		price?: number;
		coingeckoId?: string;
	}>
> = {
	[Chains.baseSepolia.id]: [
		{
			address: "0x0000000000000000000000000000000000000000",
			coingeckoId: "ethereum",
			decimals: 18,
			logo: "/icons/eth.svg",
			name: "Ethereum",
			symbol: "ETH",
			price: 3500, // Current ETH price in USD
		},
		{
			address: exp1Address,
			decimals: 18,
			logo: "/icons/exp.svg",
			name: "Experiment",
			price: 1,
			symbol: "EXP",
		},
		{
			address: exp2Address,
			decimals: 18,
			logo: "/icons/exp2.svg",
			name: "Experiment 2",
			price: 100,
			symbol: "EXP2",
		},
		{
			address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
			coingeckoId: "usd-coin",
			decimals: 6,
			logo: "/icons/usdc.svg",
			name: "USD Coin",
			symbol: "USDC",
		},
		{
			address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
			coingeckoId: "coinbase-wrapped-btc",
			decimals: 8,
			logo: "/icons/cbbtc.png",
			name: "Coinbase Wrapped BTC",
			symbol: "CBBTC",
		},
	],
};
