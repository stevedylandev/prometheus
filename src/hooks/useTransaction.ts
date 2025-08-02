import { useState } from "react";
import { parseEther, parseUnits, type Address } from "viem";
import { useSendTransaction } from "wagmi";
import { toast } from "sonner";

export interface SendTransactionParams {
	to: Address;
	amount: string;
	tokenAddress?: Address;
	decimals?: number;
}

export function useTransaction() {
	const [isPending, setIsPending] = useState(false);
	
	const { sendTransaction } = useSendTransaction({
		mutation: {
			onSuccess: (hash) => {
				toast.success(`Transaction sent: ${hash.slice(0, 10)}...`);
			},
			onError: (error) => {
				setIsPending(false);
				toast.error(`Transaction failed: ${error.message}`);
			},
		},
	});

	const sendEth = async ({ to, amount }: { to: Address; amount: string }) => {
		try {
			setIsPending(true);
			const value = parseEther(amount);
			
			sendTransaction({
				to,
				value,
			});
		} catch (error) {
			setIsPending(false);
			toast.error(`Failed to send ETH: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const sendToken = async ({ 
		to, 
		amount, 
		tokenAddress, 
		decimals = 18 
	}: {
		to: Address;
		amount: string;
		tokenAddress: Address;
		decimals?: number;
	}) => {
		try {
			setIsPending(true);
			const value = parseUnits(amount, decimals);
			
			// ERC20 transfer function signature
			const transferData = `0xa9059cbb${to.slice(2).padStart(64, '0')}${value.toString(16).padStart(64, '0')}`;
			
			sendTransaction({
				to: tokenAddress,
				data: transferData as `0x${string}`,
			});
		} catch (error) {
			setIsPending(false);
			toast.error(`Failed to send token: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	return {
		sendEth,
		sendToken,
		isPending,
	};
}