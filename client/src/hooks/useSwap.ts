import { useState } from "react";

interface SwapPriceResponse {
	buyAmount: string;
	sellAmount: string;
	buyToken: {
		symbol: string;
		address: string;
		decimals: number;
	};
	sellToken: {
		symbol: string;
		address: string;
		decimals: number;
	};
	estimatedGas: string;
	gasPrice: string;
}

interface SwapQuoteResponse extends SwapPriceResponse {
	permit2?: {
		eip712: {
			types: any;
			domain: any;
			message: any;
			primaryType: string;
		};
	};
	transaction: {
		data: string;
		to: string;
		value: string;
		gas: string;
		gasPrice: string;
	};
}

export function useSwap() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getPrice = async (
		sellToken: string,
		buyToken: string,
		sellAmount: string,
		chainId: string = "1",
	): Promise<SwapPriceResponse | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				sellToken,
				buyToken,
				sellAmount,
				chainId,
			});

			const response = await fetch(
				`${import.meta.env.VITE_SERVER_URL}/api/swap/price?${params}`,
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch price: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			setError(errorMessage);
			console.error("Price fetch error:", err);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const getQuote = async (
		sellToken: string,
		buyToken: string,
		sellAmount: string,
		taker: string,
		chainId: string = "1",
	): Promise<SwapQuoteResponse | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				sellToken,
				buyToken,
				sellAmount,
				taker,
				chainId,
			});

			const response = await fetch(
				`${import.meta.env.VITE_SERVER_URL}/api/swap/quote?${params}`,
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch quote: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			setError(errorMessage);
			console.error("Quote fetch error:", err);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		getPrice,
		getQuote,
		isLoading,
		error,
	};
}
