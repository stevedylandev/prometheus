import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { ArrowUpDownIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSwap } from "../../hooks/useSwap";
import { useAccount } from "wagmi";
import { useReadBalances } from "../../hooks/useReadBalances";
import { cn } from "@/lib/utils";
import type { AssetWithBalance } from "@/lib/types";

interface SwapViewProps {
  onSwap: (sellToken: string, buyToken: string, sellAmount: string) => void;
  isLoading: boolean;
}

function TokenCombobox({ 
  value, 
  onValueChange, 
  availableTokens,
  placeholder = "Select token..." 
}: {
  value: AssetWithBalance | null;
  onValueChange: (token: AssetWithBalance) => void;
  availableTokens: AssetWithBalance[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] justify-between"
        >
          {value ? value.symbol : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search tokens..." />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {availableTokens.map((token) => (
                <CommandItem
                  key={token.address}
                  value={token.symbol}
                  onSelect={() => {
                    onValueChange(token);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.address === token.address ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function SwapView({ onSwap, isLoading }: SwapViewProps) {
  const { address } = useAccount();
  const { getPrice, isLoading: priceLoading, error } = useSwap();
  const { 
    data: balanceData, 
    isLoading: isLoadingBalances 
  } = useReadBalances({
    address,
    chainId: 84532,
  });

  // Create a list of all available tokens (including ones with zero balance for swapping)
  const availableTokens = useMemo(() => {
    if (!balanceData) return [];
    
    // For now, just use the tokens that have balances
    // In the future, this could include all supported tokens for swapping
    return balanceData;
  }, [balanceData]);

  const [sellToken, setSellToken] = useState<AssetWithBalance | null>(null);
  const [buyToken, setBuyToken] = useState<AssetWithBalance | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  // Set default tokens when data loads
  useEffect(() => {
    if (availableTokens.length > 0 && !sellToken) {
      // Default to ETH as sell token if available
      const ethToken = availableTokens.find(token => token.symbol === "ETH");
      const usdcToken = availableTokens.find(token => token.symbol === "USDC");
      
      setSellToken(ethToken || availableTokens[0]);
      setBuyToken(usdcToken || availableTokens[1] || availableTokens[0]);
    }
  }, [availableTokens, sellToken]);

  // Format balance for display
  const formatBalance = (balance: bigint, decimals: number = 18) => {
    return (Number(balance) / 10 ** decimals).toFixed(6);
  };

  // Get balance for a specific token
  const getTokenBalance = (token: AssetWithBalance | null) => {
    if (!token) return "0.00";
    return formatBalance(token.balance, token.decimals || 18);
  };

  const handleSwapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
  };

  useEffect(() => {
    if (sellAmount && sellToken && buyToken && parseFloat(sellAmount) > 0) {
      fetchPrice();
    } else {
      setBuyAmount("");
    }
  }, [sellAmount, sellToken, buyToken]);

  const fetchPrice = async () => {
    if (!sellAmount || !sellToken || !buyToken) return;

    const decimals = sellToken.decimals || 18;
    const sellAmountWei = (parseFloat(sellAmount) * Math.pow(10, decimals)).toString();
    const priceData = await getPrice(
      sellToken.address,
      buyToken.address,
      sellAmountWei
    );

    if (priceData) {
      const buyDecimals = buyToken.decimals || 18;
      const buyAmountFormatted = (parseFloat(priceData.buyAmount) / Math.pow(10, buyDecimals)).toFixed(6);
      setBuyAmount(buyAmountFormatted);
    }
  };

  const handleSwap = () => {
    if (sellAmount && sellToken && buyToken) {
      onSwap(sellToken.symbol.toLowerCase(), buyToken.symbol.toLowerCase(), sellAmount);
    }
  };

  const canSwap = sellToken && buyToken && sellAmount && parseFloat(sellAmount) > 0;
  const hasInsufficientBalance = sellToken && sellAmount && 
    parseFloat(sellAmount) > parseFloat(getTokenBalance(sellToken));

  if (isLoadingBalances) {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-8">
        <div className="text-center">Loading balances...</div>
      </div>
    );
  }

  if (!availableTokens || availableTokens.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-8">
        <div className="text-center">
          <ArrowUpDownIcon size={48} className="opacity-70 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Tokens Available</h2>
          <p className="text-sm text-muted-foreground">
            You need some tokens to start swapping.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 items-center py-8">
      <div className="text-center">
        <ArrowUpDownIcon size={48} className="opacity-70 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Swap Tokens</h2>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Exchange tokens instantly using the 0x protocol for the best prices.
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-1">
        {/* Sell Token Section */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">Sell</span>
            {sellToken && (
              <button
                onClick={() => setSellAmount(getTokenBalance(sellToken))}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Balance: {getTokenBalance(sellToken)} {sellToken.symbol}
              </button>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <TokenCombobox 
              value={sellToken}
              onValueChange={setSellToken}
              availableTokens={availableTokens}
            />
            <Input
              type="number"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              placeholder="0.0"
              className={cn(
                "flex-1 text-right text-lg font-medium",
                hasInsufficientBalance && "border-destructive focus-visible:border-destructive"
              )}
            />
          </div>
          {hasInsufficientBalance && (
            <p className="text-xs text-destructive mt-2">
              Insufficient {sellToken?.symbol} balance
            </p>
          )}
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full h-10 w-10 border-2 bg-background shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowUpDownIcon size={16} />
          </Button>
        </div>

        {/* Buy Token Section */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">Buy</span>
            {buyToken && (
              <span className="text-xs text-muted-foreground">
                Balance: {getTokenBalance(buyToken)} {buyToken.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <TokenCombobox 
              value={buyToken}
              onValueChange={setBuyToken}
              availableTokens={availableTokens}
            />
            <Input
              type="number"
              value={buyAmount}
              placeholder="0.0"
              className="flex-1 text-right text-lg font-medium bg-muted/50"
              readOnly
            />
          </div>
        </div>

        {/* Price Information */}
        {buyAmount && sellAmount && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">
              1 {sellToken.symbol} ≈ {(parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(6)} {buyToken.symbol}
            </p>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={!canSwap || isLoading || priceLoading || hasInsufficientBalance}
          className="w-full h-12 text-base font-medium mt-6"
          size="lg"
        >
          <ArrowUpDownIcon size={18} className={isLoading || priceLoading ? "animate-spin mr-2" : "mr-2"} />
          {hasInsufficientBalance 
            ? `Insufficient ${sellToken?.symbol} Balance`
            : priceLoading 
            ? "Getting Price..." 
            : isLoading 
            ? "Swapping..." 
            : "Swap Tokens"
          }
        </Button>
        
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}