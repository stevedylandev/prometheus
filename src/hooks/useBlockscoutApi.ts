import { useQuery } from "@tanstack/react-query";
import type { Address } from "ox";
import { useAccount, useWatchBlockNumber } from "wagmi";

export function useAddressTransactions({
	address,
	chainId = 84532,
}: {
	address?: Address.Address | undefined;
	chainId?: 84532;
}) {
	const account = useAccount();
	const accountAddress = address ?? account.address;

	const { data, isLoading, isPending, refetch } = useQuery({
		enabled: Boolean(accountAddress) && account.status === "connected",
		queryFn: async () => {
			const apiEndpoint = "https://base-sepolia.blockscout.com/api/v2";

			// Fetch both transactions and token transfers in parallel
			const [transactionsResponse, tokenTransfersResponse] = await Promise.all([
				fetch(`${apiEndpoint}/addresses/${accountAddress}/transactions`),
				fetch(`${apiEndpoint}/addresses/${accountAddress}/token-transfers`),
			]);

			const transactionsData = (await transactionsResponse.json()) as {
				items: Array<Transaction>;
				next_page_params: null;
			};

			const tokenTransfersData = (await tokenTransfersResponse.json()) as {
				items: Array<TokenTransfer>;
				next_page_params: null;
			};

			// Combine and sort by timestamp (newest first)
			const allItems = [
				...transactionsData.items.map((tx) => ({
					...tx,
					itemType: "transaction" as const,
				})),
				...tokenTransfersData.items.map((transfer) => ({
					...transfer,
					itemType: "token_transfer" as const,
				})),
			].sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);

			return {
				items: allItems,
				next_page_params: null,
			};
		},
		queryKey: ["address-transactions", accountAddress, chainId],
	});

	useWatchBlockNumber({
		enabled: account.status === "connected",
		onBlockNumber: () => refetch(),
	});

	console.log(data?.items);

	return {
		data,
		isLoading,
		isPending,
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

export type Transaction = {
	timestamp: string;
	fee: {
		quantity: string;
		token: {
			address: string;
			decimals: string;
			name: string;
			symbol: string;
			type: string;
		};
	};
	gas_limit: string;
	block: number;
	status: string;
	method: string | null;
	confirmations: number;
	type: number;
	exchange_rate: string;
	to: AddressInfo;
	tx_burnt_fee: string | null;
	max_fee_per_gas: string | null;
	result: string;
	hash: string;
	gas_price: string;
	priority_fee: string | null;
	base_fee_per_gas: string | null;
	from: AddressInfo;
	token_transfers?: Array<{
		block_hash: string;
		from: AddressInfo;
		log_index: number;
		method: string;
		timestamp: string;
		to: AddressInfo;
		token: {
			address: string;
			decimals: string;
			name: string;
			symbol: string;
			type: string;
		};
		total: {
			decimals: string;
			value: string;
		};
		transaction_hash: string;
		type: string;
	}>;
	tx_types: Array<string>;
	gas_used: string;
	created_contract: AddressInfo | null;
	position: number;
	nonce: number;
	has_error_in_internal_txs: boolean;
	actions: Array<unknown>;
	decoded_input: {
		method_call: string;
		method_id: string;
		parameters: Array<{
			name: string;
			type: string;
			value: string;
		}>;
	} | null;
	value: string;
	max_priority_fee_per_gas: string | null;
	revert_reason: string | null;
	raw_input: string;
	transaction_hash: string;
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
