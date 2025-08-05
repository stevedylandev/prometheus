import type { AssetWithBalance } from "@/lib/types";
import type { Transaction, TokenTransfer } from "@/hooks/useBlockscoutApi";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { isAddressEqual } from "viem";

interface TransactionItemProps {
	item:
		| (Transaction & { itemType: "transaction" })
		| (TokenTransfer & { itemType: "token_transfer" });
	address: string;
	balances: ReadonlyArray<AssetWithBalance>;
}

export function TransactionItem({
	item,
	address,
	balances,
}: TransactionItemProps) {
	const { getPriceForAsset } = useTokenPrices(balances);

	// Determine if transaction is received or sent based on type
	const isReceived = isAddressEqual(
		item.to.hash as `0x${string}`,
		address as `0x${string}`,
	);

	const isAssetTransfer = 
		item.itemType === "token_transfer" || 
		(item.itemType === "transaction" && (item as Transaction & { itemType: "transaction" }).value !== "0");

	// Calculate USD value for asset transfers
	let usdValue = 0;
	let assetAmount = "";
	let assetSymbol = "";

	if (item.itemType === "token_transfer") {
		const tokenTransfer = item as TokenTransfer & { itemType: "token_transfer" };
		const amount =
			Number(tokenTransfer.total.value) / Math.pow(10, Number(tokenTransfer.total.decimals));
		assetAmount = amount.toFixed(4);
		assetSymbol = tokenTransfer.token.symbol;
		// Try to find matching balance to get price
		const matchingBalance = balances.find(
			(b) =>
				b.symbol === tokenTransfer.token.symbol ||
				isAddressEqual(
					b.address as `0x${string}`,
					tokenTransfer.token.address as `0x${string}`,
				),
		);
		if (matchingBalance) {
			const price = getPriceForAsset(matchingBalance);
			if (price !== null) {
				usdValue = amount * price;
			}
		}
	} else if (item.itemType === "transaction") {
		const transaction = item as Transaction & { itemType: "transaction" };
		if (transaction.value !== "0") {
			const ethAmount = Number(transaction.value) / 1e18;
			assetAmount = ethAmount.toFixed(4);
			assetSymbol = "ETH";
			// Try to find ETH balance to get price
			const ethBalance = balances.find(
				(b) =>
					b.symbol === "ETH" ||
					b.address === "0x0000000000000000000000000000000000000000",
			);
			if (ethBalance) {
				const price = getPriceForAsset(ethBalance);
				if (price !== null) {
					usdValue = ethAmount * price;
				}
			}
		}
	}

	return (
		<div
			key={item.transaction_hash}
			className="bg-zinc-900 rounded-xl px-4 py-2 hover:bg-zinc-800 transition-colors"
		>
			{isAssetTransfer ? (
				// Asset transfer layout
				<div className="space-y-1">
					<div className="flex justify-between items-center">
						<div className="text-sm text-gray-400">
							{isReceived ? "Received" : "Sent"}
						</div>
						<div className="text-sm text-gray-400">
							{usdValue > 0 ? `$${usdValue.toFixed(2)}` : "$0.00"}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<div className="font-medium">{assetSymbol}</div>
						<div
							className={`font-medium ${isReceived ? "text-green-400" : "text-red-400"}`}
						>
							{isReceived ? "+" : "-"}
							{assetAmount}
						</div>
					</div>
					<div className="text-xs text-gray-400 text-center">
						{new Date(item.timestamp).toLocaleDateString()}{" "}
						{new Date(item.timestamp).toLocaleTimeString()}
					</div>
				</div>
			) : (
				// Contract interaction layout
				<div className="space-y-2">
					<div className="text-sm text-gray-400 mb-2">Interacted</div>
					<div className="flex justify-between items-center">
						<div className="font-mono text-xs">
							{item.to.hash.slice(0, 6)}...{item.to.hash.slice(-4)}
						</div>
						<div className="text-sm">{item.method || "unknown"}</div>
					</div>
					<div className="text-xs text-gray-400 text-center">
						{new Date(item.timestamp).toLocaleDateString()}{" "}
						{new Date(item.timestamp).toLocaleTimeString()}
					</div>

					{item.itemType === "transaction" &&
						(item as Transaction & { itemType: "transaction" }).token_transfers &&
						(item as Transaction & { itemType: "transaction" }).token_transfers!.length > 0 && (
							<div className="mt-3 pt-3 border-t border-zinc-700">
								<div className="text-xs text-gray-400 mb-2">
									Token Transfers:
								</div>
								{(item as Transaction & { itemType: "transaction" }).token_transfers!.slice(0, 3).map((transfer: any, index: number) => (
									<div key={index} className="flex justify-between text-xs">
										<span>{transfer.token.symbol}</span>
										<span>
											{(
												Number(transfer.total.value) /
												Math.pow(10, Number(transfer.total.decimals))
											).toFixed(4)}
										</span>
									</div>
								))}
								{(item as Transaction & { itemType: "transaction" }).token_transfers!.length > 3 && (
									<div className="text-xs text-gray-400 mt-1">
										+{(item as Transaction & { itemType: "transaction" }).token_transfers!.length - 3} more transfers
									</div>
								)}
							</div>
						)}
				</div>
			)}
		</div>
	);
}
