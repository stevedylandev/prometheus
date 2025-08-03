import { useState, useEffect } from "react";
import type { AssetWithBalance } from "@/lib/types";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useTransaction } from "@/hooks/useTransaction";
import { AddressDisplay } from "./address-display";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	SendHorizontalIcon,
	LoaderCircleIcon,
	BadgeCheckIcon,
	CircleAlertIcon,
} from "lucide-react";
import { getEnsAddress } from "@wagmi/core";
import { config } from "@/lib/config";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";
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
	const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
	const [isResolvingEns, setIsResolvingEns] = useState(false);
	const [hasAttemptedResolve, setHasAttemptedResolve] = useState(false);
	const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
	const [showSendModal, setShowSendModal] = useState(false);
	const [sendModalAsset, setSendModalAsset] = useState<AssetWithBalance | null>(
		null,
	);

	useEffect(() => {
		const resolveEnsName = async () => {
			if (!recipient) {
				setResolvedAddress(null);
				setHasAttemptedResolve(false);
				return;
			}

			if (recipient.startsWith("0x")) {
				setResolvedAddress(recipient);
				setHasAttemptedResolve(false);
				return;
			}

			if (recipient.endsWith(".eth")) {
				setIsResolvingEns(true);
				setHasAttemptedResolve(false);
				try {
					const address = await getEnsAddress(config, {
						name: normalize(recipient),
						chainId: mainnet.id,
					});
					setResolvedAddress(address);
				} catch (error) {
					console.error("ENS resolution failed:", error);
					setResolvedAddress(null);
				} finally {
					setIsResolvingEns(false);
					setHasAttemptedResolve(true);
				}
			} else {
				setResolvedAddress(null);
				setHasAttemptedResolve(false);
			}
		};

		const timeoutId = setTimeout(resolveEnsName, 300);
		return () => clearTimeout(timeoutId);
	}, [recipient]);

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
		if (!sendModalAsset || !recipient || !sendAmount || !resolvedAddress)
			return;

		try {
			if (
				sendModalAsset.address === "0x0000000000000000000000000000000000000000"
			) {
				await sendEth({
					to: resolvedAddress as `0x${string}`,
					amount: sendAmount,
				});
			} else {
				await sendToken({
					to: resolvedAddress as `0x${string}`,
					amount: sendAmount,
					tokenAddress: sendModalAsset.address as `0x${string}`,
					decimals: sendModalAsset.decimals || 18,
				});
			}

			setSendAmount("");
			setRecipient("");
			setResolvedAddress(null);
			setHasAttemptedResolve(false);
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
		setResolvedAddress(null);
		setHasAttemptedResolve(false);
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
			{showSendModal && sendModalAsset && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
					<div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4 animate-in slide-in-from-top-4 duration-300">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">
								Send {sendModalAsset.symbol}
							</h3>
							<button
								onClick={closeSendModal}
								className="text-gray-400 hover:text-white transition-colors"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
								</svg>
							</button>
						</div>

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
								<div className="relative">
									<Input
										type="text"
										value={recipient}
										onChange={(e) => setRecipient(e.target.value)}
										placeholder="0x... or name.eth"
										autoFocus
										className="pr-10"
									/>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3">
										{isResolvingEns && (
											<LoaderCircleIcon className="h-4 w-4 text-blue-400 animate-spin" />
										)}
										{!isResolvingEns &&
											resolvedAddress &&
											resolvedAddress !== recipient && (
												<BadgeCheckIcon className="h-4 w-4 text-blue-400" />
											)}
										{!isResolvingEns &&
											hasAttemptedResolve &&
											recipient.endsWith(".eth") &&
											!resolvedAddress && (
												<CircleAlertIcon className="h-4 w-4 text-red-400" />
											)}
									</div>
								</div>
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
									disabled={
										!recipient || !sendAmount || !resolvedAddress || isPending
									}
									className="flex-1"
								>
									{isPending ? "Sending..." : "Send"}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

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
