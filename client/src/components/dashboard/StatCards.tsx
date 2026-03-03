import { Card } from "@/components/ui/card";
import { Transaction, formatINR } from "@/lib/dsa";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface StatCardsProps {
  transactions: Transaction[];
}

export function StatCards({ transactions }: StatCardsProps) {
  const { income, expense } = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = income - expense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="glass-card p-6 border-l-4 border-l-blue-500 overflow-hidden relative group">
        <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <Wallet className="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-500" />
            Current Balance
          </h3>
          <p className="text-4xl font-bold text-foreground">{formatINR(balance)}</p>
        </div>
      </Card>

      <Card className="glass-card p-6 border-l-4 border-l-emerald-500 overflow-hidden relative group">
        <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <TrendingUp className="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Total Income
          </h3>
          <p className="text-4xl font-bold text-foreground">{formatINR(income)}</p>
        </div>
      </Card>

      <Card className="glass-card p-6 border-l-4 border-l-rose-500 overflow-hidden relative group">
        <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <TrendingDown className="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Total Expenses
          </h3>
          <p className="text-4xl font-bold text-foreground">{formatINR(expense)}</p>
        </div>
      </Card>
    </div>
  );
}
