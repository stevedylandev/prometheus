import { BalanceDisplay } from "../balance-display";
import type { AssetWithBalance } from "@/lib/types";

interface HomeViewProps {
	balances: ReadonlyArray<AssetWithBalance>;
	isLoading: boolean;
	address: `0x${string}` | undefined;
}

export function HomeView({ balances, isLoading, address }: HomeViewProps) {
	return (
		<div className="w-full">
			<BalanceDisplay
				balances={balances}
				isLoading={isLoading}
				address={address}
			/>
		</div>
	);
}
