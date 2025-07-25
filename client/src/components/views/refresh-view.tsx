import { Button } from "../ui/button";
import { RefreshCcwIcon } from "lucide-react";

interface RefreshViewProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function RefreshView({ onRefresh, isLoading }: RefreshViewProps) {
  return (
    <div className="w-full flex flex-col gap-4 items-center text-center py-8">
      <RefreshCcwIcon size={48} className="opacity-70" />
      <h2 className="text-xl font-semibold">Refresh Data</h2>
      <p className="text-sm opacity-70 max-w-sm">
        Refresh your account balances and transaction history to get the latest information.
      </p>
      <Button 
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCcwIcon size={16} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Refreshing..." : "Refresh Now"}
      </Button>
    </div>
  );
}