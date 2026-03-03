import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction, sortTransactions, searchTransactionsByTitle, formatINR } from "@/lib/dsa";
import { Download, Edit2, Search, Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [ascending, setAscending] = useState(false);

  // Apply Search
  const filtered = searchTransactionsByTitle(transactions, searchQuery);
  
  // Apply Sort
  const displayed = sortTransactions(filtered, sortBy, ascending);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast({ description: "No transactions to export" });
      return;
    }
    
    const headers = ["ID", "Title", "Amount", "Type", "Category", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => 
        `${t.id},"${t.title}",${t.amount},${t.type},${t.category},${t.date}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "finwise_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Exported successfully!" });
  };

  return (
    <Card className="glass-card p-6 shadow-sm border-0 flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📋 History
        </h2>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-black/20"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-black/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setAscending(!ascending)}
              className="bg-white/50 dark:bg-black/20 shrink-0"
              title={ascending ? "Ascending" : "Descending"}
            >
              <ArrowUpDown className={`w-4 h-4 transition-transform ${ascending ? 'rotate-180' : ''}`} />
            </Button>

            <Button variant="outline" size="icon" onClick={handleExportCSV} className="bg-white/50 dark:bg-black/20 shrink-0" title="Export CSV">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="italic">No transactions found.</p>
          </div>
        ) : (
          displayed.map(t => (
            <div 
              key={t.id} 
              className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 shadow-inner ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                  {t.type === 'income' ? '💰' : '🛒'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-foreground truncate">{t.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {t.category}
                    </span>
                    <span className="text-muted-foreground">{t.date.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto">
                <span className={`font-bold text-lg sm:mr-6 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                </span>
                
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
