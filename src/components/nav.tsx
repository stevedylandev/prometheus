import { SendHorizonalIcon, HomeIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "./ui/button";

export type NavView = "home" | "send" | "refresh";

interface NavProps {
	currentView: NavView;
	onViewChange: (view: NavView) => void;
}

export function Nav({ currentView, onViewChange }: NavProps) {
	return (
		<div className="w-full flex justify-between items-center mt-6 bg-zinc-900 rounded-xl p-3">
			<Button
				variant={currentView === "home" ? "default" : "ghost"}
				className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
				onClick={() => onViewChange("home")}
			>
				<HomeIcon size={20} />
				<span className="text-xs">Home</span>
			</Button>
			<Button
				variant={currentView === "send" ? "default" : "ghost"}
				className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
				onClick={() => onViewChange("send")}
			>
				<SendHorizonalIcon size={20} />
				<span className="text-xs">Send</span>
			</Button>
			<Button
				variant={currentView === "refresh" ? "default" : "ghost"}
				className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
				onClick={() => onViewChange("refresh")}
			>
				<RefreshCcwIcon size={20} />
				<span className="text-xs">Refresh</span>
			</Button>
		</div>
	);
}
