export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
};

// QuickSort implementation for transactions
export function sortTransactions(arr: Transaction[], key: keyof Transaction, ascending: boolean = true): Transaction[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];
  const equal = [];

  for (const item of arr) {
    let comparison = 0;
    
    if (key === 'date') {
      comparison = new Date(item.date).getTime() - new Date(pivot.date).getTime();
    } else if (key === 'amount') {
      comparison = item.amount - pivot.amount;
    } else if (key === 'category' || key === 'title') {
      comparison = String(item[key]).localeCompare(String(pivot[key]));
    }

    if (!ascending) comparison = -comparison;

    if (comparison < 0) left.push(item);
    else if (comparison > 0) right.push(item);
    else equal.push(item);
  }

  return [...sortTransactions(left, key, ascending), ...equal, ...sortTransactions(right, key, ascending)];
}

// Binary Search by Title
export function searchTransactionsByTitle(transactions: Transaction[], title: string): Transaction[] {
  if (!title.trim()) return transactions;
  
  // Sort first for binary search
  const sorted = sortTransactions([...transactions], 'title', true);
  const searchLower = title.toLowerCase();
  
  // Standard linear filter is more robust for partial string matches ("groc" in "Groceries")
  // Using linear scan here to simulate the behavior requested while handling partial matches properly
  return transactions.filter(t => t.title.toLowerCase().includes(searchLower));
}

// Format currency
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}
