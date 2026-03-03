import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PlusCircle, Save, X } from "lucide-react";
import { Transaction } from "@/lib/dsa";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, "id">) => void;
  onUpdate: (id: number, t: Omit<Transaction, "id">) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
}

const CATEGORIES = ["Food", "Rent", "Shopping", "Travel", "Others"];
const TYPES = ["income", "expense"];

export function TransactionForm({ onAdd, onUpdate, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Others");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid title and amount.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      title,
      amount: Number(amount),
      type: type as "income" | "expense",
      category,
      date
    };

    if (editingTransaction) {
      onUpdate(editingTransaction.id, payload);
      toast({ title: "Transaction updated successfully" });
      onCancelEdit();
    } else {
      onAdd(payload);
      toast({ title: "Transaction added successfully" });
      resetForm();
    }
  };

  return (
    <Card className="glass-card p-6 shadow-sm border-0">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          {editingTransaction ? <Save className="w-5 h-5 text-primary" /> : <PlusCircle className="w-5 h-5 text-primary" />}
        </div>
        <h2 className="text-xl font-semibold">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Groceries" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-white/50 dark:bg-black/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="0.00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-white/50 dark:bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-white/50 dark:bg-black/20">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">💰 Income</SelectItem>
                <SelectItem value="expense">🛒 Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white/50 dark:bg-black/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-white/50 dark:bg-black/20"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            {editingTransaction ? "Save Changes" : "Add Transaction"}
          </Button>
          
          {editingTransaction && (
            <Button type="button" variant="outline" onClick={onCancelEdit} className="flex-none px-4">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
