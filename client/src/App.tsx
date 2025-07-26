import logo from "./assets/logo.png";
import { Button } from "./components/ui/button";
import { Nav, type NavView } from "./components/nav";
import { HomeView } from "./components/views/home-view";
import { SendView } from "./components/views/send-view";
import { SwapView } from "./components/views/swap-view";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadBalances } from "./hooks/useReadBalances";
import { useState } from "react";

function App() {
	const [currentView, setCurrentView] = useState<NavView>("home");
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

	const handleRefresh = () => {
		refetch();
	};

	const handleSwap = async (sellToken: string, buyToken: string, sellAmount: string) => {
		console.log('Swap:', { sellToken, buyToken, sellAmount });
		// TODO: Implement swap logic
	};

	const renderCurrentView = () => {
		switch (currentView) {
			case "home":
				return (
					<HomeView
						balances={balnaceData || []}
						isLoading={isLoading || isPending}
						address={account.address}
					/>
				);
			case "send":
				return <SendView />;
			case "swap":
				return (
					<SwapView
						onSwap={handleSwap}
						isLoading={isLoading || isPending}
					/>
				);
			default:
				return (
					<HomeView
						balances={balnaceData || []}
						isLoading={isLoading || isPending}
						address={account.address}
					/>
				);
		}
	};

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
							{renderCurrentView()}
							<Nav currentView={currentView} onViewChange={setCurrentView} />
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
