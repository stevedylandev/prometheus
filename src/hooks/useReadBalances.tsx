import type { Address } from "ox";
import { erc20Abi } from "viem";
import {
	useAccount,
	useBalance,
	useReadContracts,
	useWatchBlockNumber,
} from "wagmi";
import type { AssetWithBalance } from "@/lib/types";
import { ethAsset } from "../lib/constants";
import { useTokenList } from "./useTokenList";

export function useReadBalances({
	address,
	chainId = 84532,
}: {
	address?: Address.Address | undefined;
	chainId?: 84532;
}) {
	const account = useAccount();
	const accountAddress = address ?? account.address;
	
	// Fetch dynamic token list
	const { data: tokenList, isLoading: isLoadingTokens } = useTokenList({
		address: accountAddress,
		chainId,
	});
	
	// Filter out ETH (zero address) for ERC20 contract calls
	const assets = tokenList?.filter(
		(asset) => asset.address !== "0x0000000000000000000000000000000000000000",
	) ?? [];

	const { data: ethBalance } = useBalance({ address: accountAddress, chainId });

	const { data, isLoading: isLoadingBalances, isPending, refetch } = useReadContracts({
		contracts: assets.map((asset) => ({
			abi: erc20Abi,
			address: asset.address,
			args: [accountAddress],
			functionName: "balanceOf",
		})),
		query: {
			enabled: assets.length > 0 && Boolean(accountAddress),
			select: (data) => {
				const result = data.map((datum, index) => {
					return {
						balance:
							typeof datum.result === "bigint"
								? datum.result
								: BigInt(datum.result ?? 0),
						...assets[index],
					};
				});

				// Add ETH as the first token
				result.unshift({ balance: ethBalance?.value ?? 0n, ...ethAsset });

				return result as ReadonlyArray<AssetWithBalance>;
			},
		},
	});

	useWatchBlockNumber({
		enabled: account.status === "connected",
		onBlockNumber: () => refetch(),
	});

	return {
		data,
		isLoading: isLoadingTokens || isLoadingBalances,
		isPending,
		refetch,
	};
}
