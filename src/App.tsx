import logo from "./assets/logo.png";
import { Button } from "./components/ui/button";
import { BalanceDisplay } from "./components/ui/balance-display";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadBalances } from "./hooks/useReadBalances";

function App() {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const {
		data: balnaceData,
		isLoading,
		isPending,
	} = useReadBalances({
		address: account.address,
		chainId: 84532,
	});

	const { connectors, connect } = useConnect();
	const connector = connectors.find(
		(connector) => connector.id === "xyz.ithaca.porto",
	)!;

	return (
		<main className="min-h-screen flex flex-col items-center justify-center">
			{account.address ? (
				<div className="w-full max-w-sm px-4 mx-auto">
					<div className="flex flex-col gap-4">
						<div className="flex justify-end items-center mt-2">
							<Button
								variant="destructive"
								type="button"
								className="cursor-pointer text-xs h-6"
								onClick={() => disconnect()}
							>
								Sign out
							</Button>
						</div>
						<div className="w-full">
							<BalanceDisplay
								balances={balnaceData || []}
								isLoading={isLoading || isPending}
								address={account.address}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="max-w-lg flex flex-col items-center gap-4">
					<img src={logo} alt="promethus logo" />
					<h1 className="text-4xl">Prometheus</h1>
					<h3>Open Source EVM Wallets</h3>
					<Button onClick={() => connect({ connector })}>Sign in</Button>
				</div>
			)}
		</main>
	);
}

export default App;
