import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Coins, 
  AlertTriangle, 
  TrendingUp, 
  Truck 
} from "lucide-react";
import { InventoryItem } from "./mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface InventoryModuleProps {
  inventory: InventoryItem[];
  onSellItem: (itemId: string, quantity: number) => void;
  onAddStock: (itemId: string, quantity: number) => void;
}

export default function InventoryModule({
  inventory,
  onSellItem,
  onAddStock
}: InventoryModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleSellClick = (itemId: string, itemName: string, currentStock: number) => {
    if (currentStock <= 0) {
      toast.error(`"${itemName}" is currently out of stock!`);
      return;
    }
    const qty = prompt(`Enter quantity to sell of "${itemName}" (Stock: ${currentStock}):`, "1");
    if (qty) {
      const parsedQty = parseInt(qty);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        toast.error("Please enter a valid quantity.");
        return;
      }
      if (parsedQty > currentStock) {
        toast.error("Not enough stock remaining.");
        return;
      }
      onSellItem(itemId, parsedQty);
      toast.success(`Successfully sold ${parsedQty} unit(s) of "${itemName}"!`);
    }
  };

  const handleRestockClick = (itemId: string, itemName: string) => {
    const qty = prompt(`Enter restock units count for "${itemName}":`, "10");
    if (qty) {
      const parsedQty = parseInt(qty);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        toast.error("Please enter a valid quantity.");
        return;
      }
      onAddStock(itemId, parsedQty);
      toast.success(`Restocked ${parsedQty} units for "${itemName}".`);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate quick stats
  const totalItemsCount = inventory.length;
  const lowStockCount = inventory.filter(item => item.stock <= item.minStock).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Catalog Count</span>
            <p className="text-3xl font-black text-white">{totalItemsCount} products</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Low Stock warnings</span>
            <p className="text-3xl font-black text-amber-500">{lowStockCount} items</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Out of Stock</span>
            <p className="text-3xl font-black text-[#FF5252]">{outOfStockCount} items</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#FF5252]/10 flex items-center justify-center text-[#FF5252]">
            <Minus size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Top Sales Category</span>
            <p className="text-3xl font-black text-[#00C853]">Supplements</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search options bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search catalog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-white/5 bg-[#171717] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 border-white/5 bg-[#171717] text-white rounded-xl">
            <SelectValue placeholder="Choose Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Supplements">Fitness Supplements</SelectItem>
            <SelectItem value="Accessories">Athlete Accessories</SelectItem>
            <SelectItem value="Merchandise">Club Apparel & Merchandise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roster list table */}
      <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden shadow-lg animate-in fade-in duration-200">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Available</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier Node</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                  No catalog items found matching search terms.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => {
                const isLow = item.stock <= item.minStock && item.stock > 0;
                const isOut = item.stock === 0;

                return (
                  <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold py-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-bold leading-tight">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">{item.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">{item.category}</TableCell>
                    <TableCell className="text-sm font-bold text-white">₹{item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono font-bold text-xs">{item.stock} units</span>
                        {isOut && (
                          <span className="px-2 py-0.5 rounded bg-[#FF5252]/10 text-[#FF5252] text-[9px] font-black uppercase tracking-wider">
                            Out of stock
                          </span>
                        )}
                        {isLow && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider">
                            Low stock
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-medium flex items-center gap-1.5 py-5">
                      <Truck size={12} className="text-slate-500" />
                      <span>{item.supplier}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleSellClick(item.id, item.name, item.stock)}
                          disabled={isOut}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                            isOut 
                              ? "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed" 
                              : "bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853] hover:bg-[#00C853]/20"
                          }`}
                        >
                          <Coins size={12} />
                          <span>Sell</span>
                        </button>
                        <button
                          onClick={() => handleRestockClick(item.id, item.name)}
                          className="px-3 py-1.5 bg-white/5 border border-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Restock</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
