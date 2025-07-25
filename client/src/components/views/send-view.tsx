import { Button } from "../ui/button";

export function SendView() {
  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Send Tokens</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">To Address</label>
          <input 
            type="text" 
            placeholder="0x..." 
            className="w-full p-3 bg-zinc-900 rounded-xl border border-zinc-700 focus:border-zinc-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input 
            type="number" 
            placeholder="0.00" 
            className="w-full p-3 bg-zinc-900 rounded-xl border border-zinc-700 focus:border-zinc-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Token</label>
          <select className="w-full p-3 bg-zinc-900 rounded-xl border border-zinc-700 focus:border-zinc-500 outline-none">
            <option>Select Token</option>
          </select>
        </div>
        <Button className="w-full">Send Transaction</Button>
      </div>
    </div>
  );
}