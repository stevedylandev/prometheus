import { useQuery } from "@tanstack/react-query";
import type { Address } from "ox";
import { useAccount, useWatchBlockNumber } from "wagmi";
import { CORS_DESTROYER_URL, ethAsset } from "@/lib/constants";

export type TokenInfo = {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: number | null;
};

export function useTokenList({
  address,
  chainId = 84532,
}: {
  address?: Address.Address | undefined;
  chainId?: 84532;
}) {
  const account = useAccount();
  const userAddress = address ?? account.address;

  const result = useQuery({
    enabled: Boolean(userAddress),
    queryFn: async () => {
      const apiEndpoint = "https://base-sepolia.blockscout.com/api/v2";
      const url = `${CORS_DESTROYER_URL}?url=${apiEndpoint}/addresses/${userAddress}/tokens`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch token list");
      }

      const data = (await response.json()) as {
        items: Array<{
          token: TokenInfo;
          value: string;
        }>;
        next_page_params: null;
      };

      // Transform the data to match our AssetWithBalance type (without balance)
      const tokens = data.items.map((item) => ({
        address: item.token.address as Address.Address,
        decimals: parseInt(item.token.decimals, 10),
        logo: item.token.icon_url || "/icons/token-placeholder.svg", // Fallback icon
        name: item.token.name,
        symbol: item.token.symbol,
      }));

      // Add ETH as the first token
      const allTokens = [
        {
          ...ethAsset,
        },
        ...tokens,
      ];

      return allTokens as Array<typeof ethAsset>;
    },
    queryKey: ["token-list", userAddress, chainId],
    refetchInterval: 30_000, // Refetch every 30 seconds
  });

  useWatchBlockNumber({
    enabled: account.status === "connected",
    onBlockNumber: () => result.refetch(),
  });

  return result;
}