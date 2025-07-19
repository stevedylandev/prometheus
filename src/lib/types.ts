export type AssetWithBalance = {
	balance: bigint;
	logo: string;
	symbol: string;
	name: string;
	address: string;
	decimals?: number;
	price?: number;
	coingeckoId?: string;
};
