import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "ox";
import * as React from "react";
import { useAccount, useWatchBlockNumber } from "wagmi";
import { urlWithCorsBypass } from "../lib/constants";
import { useReadBalances } from "./useReadBalances";

export function useAddressTransfers({
	address,
}: {
	address?: Address.Address | undefined;
} = {}) {
	const account = useAccount();

	const userAddress = address ?? account.address;
	const userChainId = 84532;

	const { refetch: refetchBalances } = useReadBalances({
		address: userAddress,
		chainId: userChainId,
	});

	const result = useQuery({
		enabled: account.status === "connected",
		queryFn: async () => {
			const apiEndpoint = "https://base-sepolia.blockscout.com/api/v2";
			const url = `${apiEndpoint}/addresses/${userAddress}/token-transfers`;
			const response = await fetch(urlWithCorsBypass(url));

			const data = (await response.json()) as {
				items: Array<TokenTransfer>;
				next_page_params: null;
			};
			return {
				items: data.items,
				next_page_params: data.next_page_params,
			};
		},
		queryKey: ["address-transfers", userAddress, userChainId],
		refetchInterval: 2_500,
	});

	const queryClient = useQueryClient();

	const refetch = React.useCallback(
		() =>
			queryClient
				.invalidateQueries({
					queryKey: ["address-transfers", userAddress],
				})
				.then(() => refetchBalances()),
		[userAddress, refetchBalances, queryClient],
	);

	useWatchBlockNumber({
		enabled: account.status === "connected",
		onBlockNumber: () => refetch(),
	});

	return {
		...result,
		refetch,
	};
}

type AddressInfo = {
	ens_domain_name: string | null;
	hash: string;
	implementations: Array<{
		address: string;
		name: string | null;
	}>;
	is_contract: boolean;
	is_scam: boolean;
	is_verified: boolean;
	metadata: Record<string, unknown> | null;
	name: string | null;
	private_tags: Array<Record<string, unknown>>;
	proxy_type: string | null;
	public_tags: Array<Record<string, unknown>>;
	watchlist_names: Array<string>;
};

export type TokenTransfer = {
	block_hash: string;
	block_number: number;
	from: AddressInfo;
	log_index: number;
	method: string;
	timestamp: string;
	to: AddressInfo;
	token: {
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
	total: {
		decimals: string;
		value: string;
	};
	transaction_hash: string;
	type: string;
};
