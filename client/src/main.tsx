import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import { config } from "./lib/config.ts";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<App />
					<Toaster />
				</ThemeProvider>
			</QueryClientProvider>
		</WagmiProvider>
	</StrictMode>,
);
