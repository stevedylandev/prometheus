import { useState } from "react";
import type { AssetWithBalance } from "@/lib/types";
import type { Transaction, TokenTransfer } from "@/hooks/useBlockscoutApi";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { AddressDisplay } from "./address-display";
import { TransactionItem } from "./transaction-item";
import { SendModal } from "./send-modal";
import { SendHorizontalIcon, HistoryIcon, WalletIcon } from "lucide-react";
import logo from "../assets/logo.png";

type ViewMode = "assets" | "transactions";

interface BalanceDisplayProps {
	balances: ReadonlyArray<AssetWithBalance>;
	isLoading: boolean;
	address: string;
	transactions: ReadonlyArray<
		| (Transaction & { type: "transaction" })
		| (TokenTransfer & { type: "token_transfer" })
	>;
}

export function BalanceDisplay({
	balances,
	isLoading,
	address,
	transactions,
}: BalanceDisplayProps) {
	const { getPriceForAsset, isLoading: isPricesLoading } =
		useTokenPrices(balances);
	const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
	const [showSendModal, setShowSendModal] = useState(false);
	const [sendModalAsset, setSendModalAsset] = useState<AssetWithBalance | null>(
		null,
	);
	const [currentView, setCurrentView] = useState<ViewMode>("assets");

	const switchToView = (view: ViewMode) => {
		setCurrentView(view);
	};

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

		if (price === null) {
			return 0;
		}

		return tokenAmount * price;
	};

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

	const closeSendModal = () => {
		setShowSendModal(false);
		setSendModalAsset(null);
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
			<SendModal
				isOpen={showSendModal}
				onClose={closeSendModal}
				asset={sendModalAsset}
			/>

			<div className="space-y-4">
				{currentView === "transactions" && (
					<>
						<div className="h-[400px] overflow-y-scroll space-y-2">
							{transactions.length === 0 ? (
								<div className="text-center py-8 text-gray-400">
									No transactions found
								</div>
							) : (
								transactions.map((item) => (
									<TransactionItem
										key={item.transaction_hash}
										item={item}
										address={address}
										balances={balances}
									/>
								))
							)}
						</div>
						<button
							type="button"
							onClick={() => switchToView("assets")}
							className="rounded-xl bg-zinc-900 flex items-center justify-center gap-2 px-4 py-2 hover:bg-zinc-700 transition-all duration-300 cursor-pointer"
						>
							<WalletIcon className="w-5 h-5" />
							<span className="text-sm font-medium">Show Assets</span>
						</button>
					</>
				)}
				{currentView === "assets" && (
					<>
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
														<span className="text-sm opacity-70">
															{asset.name}
														</span>
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
						<button
							type="button"
							onClick={() => switchToView("transactions")}
							className="rounded-xl bg-zinc-900 flex items-center justify-center gap-2 px-4 py-2 hover:bg-zinc-700 transition-all duration-300 cursor-pointer"
						>
							<HistoryIcon className="w-5 h-5" />
							<span className="text-sm font-medium">Show History</span>
						</button>
					</>
				)}
			</div>
		</div>
	);
}
