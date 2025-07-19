import type { AssetWithBalance } from "@/lib/types";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { AddressDisplay } from "./address-display";

interface BalanceDisplayProps {
	balances: ReadonlyArray<AssetWithBalance>;
	isLoading: boolean;
	address: string;
}

export function BalanceDisplay({
	balances,
	isLoading,
	address,
}: BalanceDisplayProps) {
	const { getPriceForAsset, isLoading: isPricesLoading } =
		useTokenPrices(balances);

	if (isLoading || isPricesLoading) {
		return <div className="w-full text-center py-4">Loading balances...</div>;
	}

	if (!balances || balances.length === 0) {
		return (
			<div className="w-full text-center py-4">No balance data available</div>
		);
	}

	const calculateDollarValue = (
		balance: bigint,
		decimals: number = 18,
		asset: AssetWithBalance,
	) => {
		const tokenAmount = Number(balance) / 10 ** decimals;
		const price = getPriceForAsset(asset);

		// If price is null, we can't calculate the dollar value
		if (price === null) {
			return 0;
		}

		return tokenAmount * price;
	};

	// Calculate total balance
	const totalBalance = balances.reduce((total, asset) => {
		return (
			total + calculateDollarValue(asset.balance, asset.decimals || 18, asset)
		);
	}, 0);

	const formatBalance = (balance: bigint, decimals: number = 18) => {
		return (Number(balance) / 10 ** decimals).toFixed(4);
	};

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Total Balance Section */}
			<div className="flex justify-between">
				<div className="flex flex-col">
					<p className="text-sm opacity-70">Your Account</p>
					<p className="text-xl font-semibold">${totalBalance.toFixed(2)}</p>
				</div>
				<AddressDisplay address={address} />
			</div>

			{/* Individual Token List */}
			<div className="space-y-2">
				{balances
					.filter((asset) => Number(asset.balance) > 0)
					.map((asset) => (
						<div
							key={asset.symbol}
							className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
						>
							<div className="flex items-center gap-3">
								{/* {asset.logo && (
								<div className="w-10 h-10 rounded-full overflow-hidden bg-pink-300 flex items-center justify-center">
									<img
										src={asset.logo}
										alt={asset.symbol}
										className="w-6 h-6"
									/>
								</div>
							)} */}
								<div className="flex flex-col">
									<span className="font-medium">{asset.symbol}</span>
									{asset.name && (
										<span className="text-sm opacity-70">{asset.name}</span>
									)}
								</div>
							</div>
							<div className="text-right">
								<div className="font-semibold">
									{formatBalance(asset.balance, asset.decimals || 18)}
								</div>
								<div className="text-sm opacity-70">
									{getPriceForAsset(asset) === null ? (
										<span className="text-yellow-500">Price unavailable</span>
									) : (
										`$${calculateDollarValue(
											asset.balance,
											asset.decimals || 18,
											asset,
										).toFixed(2)}`
									)}
								</div>
								{/* Add price change indicator here if needed */}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
