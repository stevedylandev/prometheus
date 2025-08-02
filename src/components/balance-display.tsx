import { useState } from "react";
import type { AssetWithBalance } from "@/lib/types";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useTransaction } from "@/hooks/useTransaction";
import { AddressDisplay } from "./address-display";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import logo from "../assets/logo.png";

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
	const { sendEth, sendToken, isPending } = useTransaction();
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<AssetWithBalance | null>(
		null,
	);

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

	const handleSend = async () => {
		if (!selectedAsset || !recipient || !sendAmount) return;

		try {
			if (
				selectedAsset.address === "0x0000000000000000000000000000000000000000"
			) {
				await sendEth({ to: recipient as `0x${string}`, amount: sendAmount });
			} else {
				await sendToken({
					to: recipient as `0x${string}`,
					amount: sendAmount,
					tokenAddress: selectedAsset.address as `0x${string}`,
					decimals: selectedAsset.decimals || 18,
				});
			}

			setSendAmount("");
			setRecipient("");
			setSelectedAsset(null);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	};

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Total Balance Section */}
			<div className="flex justify-between">
				<div className="flex flex-col gap-2">
					<img src={logo} alt="promethus logo" className="max-w-[50px]" />
					<p className="text-sm opacity-70">Your Account</p>
					<p className="text-xl font-semibold">${totalBalance.toFixed(2)}</p>
				</div>
				<AddressDisplay address={address} />
			</div>

			{/* Send Transaction Section */}
			<div className="bg-zinc-900 rounded-xl p-4 space-y-3">
				<h3 className="text-lg font-semibold">Send Transaction</h3>

				<div className="space-y-2">
					<Label>Select Token</Label>
					<select
						value={selectedAsset?.symbol || ""}
						onChange={(e) => {
							const asset = balances.find((b) => b.symbol === e.target.value);
							setSelectedAsset(asset || null);
						}}
						className="w-full p-2 bg-zinc-800 rounded border-zinc-700 text-white"
					>
						<option value="">Choose token...</option>
						{balances.map((asset) => (
							<option key={asset.symbol} value={asset.symbol}>
								{asset.symbol} (
								{formatBalance(asset.balance, asset.decimals || 18)})
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<Label>Recipient Address</Label>
					<Input
						type="text"
						value={recipient}
						onChange={(e) => setRecipient(e.target.value)}
						placeholder="0x..."
					/>
				</div>

				<div className="space-y-2">
					<Label>Amount</Label>
					<Input
						value={sendAmount}
						onChange={(e) => setSendAmount(e.target.value)}
						placeholder="0.0"
					/>
				</div>

				<Button
					onClick={handleSend}
					disabled={!selectedAsset || !recipient || !sendAmount || isPending}
					className="w-full"
				>
					{isPending ? "Sending..." : "Send Transaction"}
				</Button>
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
										<span>$0.00</span>
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
