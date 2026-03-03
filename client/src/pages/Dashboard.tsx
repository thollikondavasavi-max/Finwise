import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Insights } from "@/components/dashboard/Insights";
import { useTransactions } from "@/hooks/use-transactions";
import { Transaction } from "@/lib/dsa";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("finwise_auth_token");
    if (!token) {
      setLocation("/auth");
    }
  }, [setLocation]);

  // Budget checking logic
  const checkBudgetAlert = (t: Omit<Transaction, "id">) => {
    if (t.type !== 'expense') return;
    
    // Simple mock budgets
    const budgets: Record<string, number> = { 
      Food: 5000, 
      Shopping: 3000, 
      Travel: 4000, 
      Rent: 15000, 
      Others: 2000 
    };

    const category = t.category;
    const limit = budgets[category];
    
    if (limit) {
      // Calculate current total for this category including the new transaction
      const currentTotal = transactions
        .filter(tx => tx.type === 'expense' && tx.category === category)
        .reduce((sum, tx) => sum + tx.amount, 0) + t.amount;

      if (currentTotal > limit) {
        toast({
          title: "⚠️ Budget Alert",
          description: `You've exceeded your budget for ${category}! Spent: ₹${currentTotal} (Limit: ₹${limit})`,
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const handleAdd = (t: Omit<Transaction, "id">) => {
    addTransaction(t);
    checkBudgetAlert(t);
  };

  const handleUpdate = (id: number, t: Omit<Transaction, "id">) => {
    updateTransaction(id, t);
    checkBudgetAlert(t);
  };

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Header />
      
      <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatCards transactions={transactions} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 h-full flex flex-col">
            <TransactionForm 
              onAdd={handleAdd} 
              onUpdate={handleUpdate}
              editingTransaction={editingTx}
              onCancelEdit={() => setEditingTx(null)}
            />
          </div>
          
          <div className="lg:col-span-8 h-full">
            <TransactionList 
              transactions={transactions} 
              onEdit={setEditingTx} 
              onDelete={deleteTransaction} 
            />
          </div>
        </div>

        <Insights transactions={transactions} />
      </main>
    </div>
  );
}
