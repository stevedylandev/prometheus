import logo from "./assets/logo.png";
import { Button } from "./components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadBalances } from "./hooks/useReadBalances";

function App() {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const {
		data: balnaceData,
		isLoading,
		isPending,
		refetch,
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
			<div className="max-w-lg flex flex-col items-center gap-4">
				{account.address ? (
					<div className="flex flex-col items-center justify-center gap-4">
						<div>
							{account.address.slice(0, 6)}...{account.address.slice(-4)}
						</div>
						<div className="flex flex-col items-center gap-2">
							<h3 className="text-lg font-semibold">Balance Details</h3>
							{isLoading || isPending ? (
								<div>Loading balances...</div>
							) : balnaceData ? (
								<div className="text-center">
									<pre className="text-sm p-2 rounded">
										{JSON.stringify(
											balnaceData,
											(key, value) =>
												typeof value === "bigint" ? value.toString() : value,
											2,
										)}
									</pre>
								</div>
							) : (
								<div>No balance data available</div>
							)}
							<Button type="button" onClick={() => refetch()}>
								Refresh Balances
							</Button>
						</div>
						<Button type="button" onClick={() => disconnect()}>
							Sign out
						</Button>
					</div>
				) : (
					<>
						<img src={logo} alt="promethus logo" />
						<h1 className="text-4xl">Prometheus</h1>
						<h3>Open Source EVM Wallets</h3>
						<Button onClick={() => connect({ connector })}>Sign in</Button>
					</>
				)}
			</div>
		</main>
	);
}

export default App;
