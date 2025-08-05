import { useState, useEffect } from "react";
import type { AssetWithBalance } from "@/lib/types";
import { useTransaction } from "@/hooks/useTransaction";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	LoaderCircleIcon,
	BadgeCheckIcon,
	CircleAlertIcon,
} from "lucide-react";
import { getEnsAddress } from "@wagmi/core";
import { config } from "@/lib/config";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";

interface SendModalProps {
	isOpen: boolean;
	onClose: () => void;
	asset: AssetWithBalance | null;
}

export function SendModal({ isOpen, onClose, asset }: SendModalProps) {
	const { sendEth, sendToken, isPending } = useTransaction();
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
	const [isResolvingEns, setIsResolvingEns] = useState(false);
	const [hasAttemptedResolve, setHasAttemptedResolve] = useState(false);

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

	const formatBalance = (balance: bigint, decimals: number = 18) => {
		return (Number(balance) / 10 ** decimals).toFixed(4);
	};

	const handleSend = async () => {
		if (!asset || !recipient || !sendAmount || !resolvedAddress) return;

		try {
			if (asset.address === "0x0000000000000000000000000000000000000000") {
				await sendEth({
					to: resolvedAddress as `0x${string}`,
					amount: sendAmount,
				});
			} else {
				await sendToken({
					to: resolvedAddress as `0x${string}`,
					amount: sendAmount,
					tokenAddress: asset.address as `0x${string}`,
					decimals: asset.decimals || 18,
				});
			}

			setSendAmount("");
			setRecipient("");
			setResolvedAddress(null);
			setHasAttemptedResolve(false);
			onClose();
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	};

	if (!isOpen || !asset) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
			<div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4 animate-in slide-in-from-top-4 duration-300">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">Send {asset.symbol}</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-white transition-colors"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<title>Close</title>
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
						<span className="text-sm opacity-70">Token</span>
						<div className="text-right">
							<div className="font-medium">{asset.symbol}</div>
							<div className="text-sm opacity-70">
								Balance: {formatBalance(asset.balance, asset.decimals || 18)}
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
						<Button variant="outline" onClick={onClose} className="flex-1">
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
	);
}
