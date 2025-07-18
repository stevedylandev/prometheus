import logo from "./assets/logo.png";
import { Button } from "./components/ui/button";

function App() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center">
			<div className="max-w-lg flex flex-col items-center gap-4">
				<img src={logo} alt="promethus logo" />
				<h1 className="text-4xl">Prometheus</h1>
				<h3>Open Source EVM Wallets</h3>
				<Button className="mt-4" disabled>
					Coming Soon
				</Button>
			</div>
		</main>
	);
}

export default App;
