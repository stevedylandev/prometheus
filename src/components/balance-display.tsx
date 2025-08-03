import { useState } from "react";
import type { AssetWithBalance } from "@/lib/types";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useTransaction } from "@/hooks/useTransaction";
import { AddressDisplay } from "./address-display";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { SendHorizontalIcon } from "lucide-react";
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
	const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
	const [showSendModal, setShowSendModal] = useState(false);
	const [sendModalAsset, setSendModalAsset] = useState<AssetWithBalance | null>(
		null,
	);

	if (isLoading || isPricesLoading) {
		return <div className="w-full text-center py-4">Loading balances...</div>;
	}

	// if (!balances || balances.length === 0) {
	// 	return (
	// 		<div className="w-full text-center py-4">No balance data available</div>
	// 	);
	// }

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

	const handleSendClick = (asset: AssetWithBalance) => {
		setSendModalAsset(asset);
		setShowSendModal(true);
	};

	const handleSend = async () => {
		if (!sendModalAsset || !recipient || !sendAmount) return;

		try {
			if (
				sendModalAsset.address === "0x0000000000000000000000000000000000000000"
			) {
				await sendEth({ to: recipient as `0x${string}`, amount: sendAmount });
			} else {
				await sendToken({
					to: recipient as `0x${string}`,
					amount: sendAmount,
					tokenAddress: sendModalAsset.address as `0x${string}`,
					decimals: sendModalAsset.decimals || 18,
				});
			}

			setSendAmount("");
			setRecipient("");
			setSendModalAsset(null);
			setShowSendModal(false);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	};

	const closeSendModal = () => {
		setShowSendModal(false);
		setSendModalAsset(null);
		setSendAmount("");
		setRecipient("");
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

			{/* Send Modal */}
			<Dialog open={showSendModal} onOpenChange={setShowSendModal}>
				<DialogContent className="sm:w-[400px] bg-zinc-900 border-zinc-700 mx-2">
					<DialogHeader>
						<DialogTitle>Send {sendModalAsset?.symbol}</DialogTitle>
					</DialogHeader>

					{sendModalAsset && (
						<div className="space-y-4">
							<div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
								<span className="text-sm opacity-70">Token</span>
								<div className="text-right">
									<div className="font-medium">{sendModalAsset.symbol}</div>
									<div className="text-sm opacity-70">
										Balance:{" "}
										{formatBalance(
											sendModalAsset.balance,
											sendModalAsset.decimals || 18,
										)}
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Recipient Address</Label>
								<Input
									type="text"
									value={recipient}
									onChange={(e) => setRecipient(e.target.value)}
									placeholder="0x..."
									autoFocus
								/>
							</div>

							<div className="space-y-2">
								<Label>Amount</Label>
								<Input
									type="number"
									value={sendAmount}
									onChange={(e) => setSendAmount(e.target.value)}
									placeholder="0.00"
									step="any"
									style={{
										WebkitAppearance: "none",
										MozAppearance: "textfield",
									}}
								/>
							</div>

							<div className="flex gap-3 pt-2">
								<Button
									variant="outline"
									onClick={closeSendModal}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSend}
									disabled={!recipient || !sendAmount || isPending}
									className="flex-1"
								>
									{isPending ? "Sending..." : "Send"}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Individual Token List */}
			<div className="space-y-2">
				{balances
					.filter((asset) => Number(asset.balance) > 0)
					.map((asset) => (
						<div
							key={asset.symbol}
							className="relative overflow-hidden bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
							onMouseEnter={() => setHoveredAsset(asset.symbol)}
							onMouseLeave={() => setHoveredAsset(null)}
						>
							{/* Main balance card */}
							<div
								className={`flex justify-between items-center p-4 transition-transform duration-300 ${
									hoveredAsset === asset.symbol
										? "-translate-x-16"
										: "translate-x-0"
								}`}
							>
								<div className="flex items-center gap-3">
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
								</div>
							</div>

							{/* Send arrow button - appears when card slides */}
							<button
								type="button"
								className={`absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer rounded-full flex items-center justify-center transition-all duration-300 ${
									hoveredAsset === asset.symbol
										? "opacity-100 translate-x-0"
										: "opacity-0 translate-x-4"
								}`}
								onClick={() => handleSendClick(asset)}
							>
								<SendHorizontalIcon />
							</button>
						</div>
					))}
			</div>
		</div>
	);
}
