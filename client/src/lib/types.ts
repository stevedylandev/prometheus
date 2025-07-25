export type Asset = {
	logo: string;
	symbol: string;
	name: string;
	address: string;
	decimals?: number;
	price?: number;
	coingeckoId?: string;
};

export type AssetWithBalance = Asset & {
	balance: bigint;
};
