import { useQuery } from "@tanstack/react-query";
//import { urlWithCorsBypass } from "../lib/constants";
import type { AssetWithBalance } from "@/lib/types";

// Define the CoinGecko API response type
interface CoinGeckoPrice {
	[id: string]: {
		usd: number;
	};
}

export function useTokenPrices(assets: ReadonlyArray<AssetWithBalance> = []) {
	// Extract coingeckoIds from assets that have them
	const assetsWithCoingeckoIds = assets.filter((asset) => asset.coingeckoId);
	const coingeckoIds = assetsWithCoingeckoIds.map(
		(asset) => asset.coingeckoId,
	) as string[];

	// Fetch prices from CoinGecko API for assets with coingeckoIds
	const { data: coingeckoPrices, isLoading: isCoingeckoLoading } = useQuery({
		queryKey: ["token-prices-coingecko", coingeckoIds],
		queryFn: async () => {
			if (coingeckoIds.length === 0) return {};

			const idsParam = coingeckoIds.join(",");
			const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch prices: ${response.statusText}`);
			}
			return (await response.json()) as CoinGeckoPrice;
		},
		enabled: coingeckoIds.length > 0,
		refetchInterval: 60000, // Refetch every minute
		retry: 3,
	});

	// Get list of tokens that need prices from other sources
	const tokensNeedingPrices = assets.filter(
		(asset) => !asset.price && !asset.coingeckoId,
	);

	// Fetch ETH price from CoinGecko if needed
	const needsEthPrice = tokensNeedingPrices.some(
		(asset) => asset.symbol === "ETH",
	);

	const { data: ethPrice, isLoading: isEthLoading } = useQuery({
		queryKey: ["eth-price"],
		queryFn: async () => {
			const url =
				"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ETH price: ${response.statusText}`);
			}
			const data = await response.json();
			return data.ethereum?.usd || null;
		},
		enabled: needsEthPrice,
		refetchInterval: 60000, // Refetch every minute
		retry: 3,
	});

	// Function to get price for a specific asset
	const getPriceForAsset = (asset: AssetWithBalance): number | null => {
		// If the asset has a hardcoded price, use that
		if (asset.price !== undefined) return asset.price;

		// If we have price data from CoinGecko and the asset has a coingeckoId
		if (
			coingeckoPrices &&
			asset.coingeckoId &&
			coingeckoPrices[asset.coingeckoId]
		) {
			return coingeckoPrices[asset.coingeckoId].usd;
		}

		// For ETH, use the fetched ETH price
		if (asset.symbol === "ETH" && ethPrice) {
			return ethPrice;
		}

		// If we couldn't get a price, return null
		return null;
	};

	// Return the price data and helper function
	return {
		priceData: {
			coingeckoPrices,
			ethPrice,
		},
		isLoading: isCoingeckoLoading || isEthLoading,
		getPriceForAsset,
	};
}
