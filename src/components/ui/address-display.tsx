import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { toast } from "sonner";
import { Cuer } from "cuer";

interface AddressDisplayProps {
	address: string;
	className?: string;
}

export function AddressDisplay({ address, className }: AddressDisplayProps) {
	const [copied, setCopied] = React.useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			toast("Address Copied!");
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy address:", err);
		}
	};

	return (
		<button
			className={cn(
				"flex w-[150px] items-center justify-center gap-3 hover:cursor-pointer!",
				className,
			)}
			onClick={copyToClipboard}
		>
			<Cuer.Root
				className="rounded-lg border border-surface bg-white p-2.5 dark:bg-secondary"
				value={address ?? ""}
			>
				<Cuer.Finder radius={1} />
				<Cuer.Cells />
			</Cuer.Root>
			<p className="min-w-[6ch] max-w-[6ch] text-pretty break-all font-mono font-normal text-[11px] text-gray10">
				{address}
			</p>
		</button>
	);
}
