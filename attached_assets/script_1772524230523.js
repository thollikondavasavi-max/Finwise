// FinWise - Frontend Logic with DSA

// ==================== Data Structures & Algorithms ====================
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.categoryMap = new Map(); // for O(1) category totals
        this.nextId = 1;
    }

    // Load from localStorage (or API)
    loadFromStorage() {
        const stored = localStorage.getItem('finwise_transactions');
        if (stored) {
            this.transactions = JSON.parse(stored);
            this.nextId = this.transactions.length ? Math.max(...this.transactions.map(t => t.id)) + 1 : 1;
            this.buildCategoryMap();
        } else {
            // Seed demo data
            this.seedDemoData();
        }
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('finwise_transactions', JSON.stringify(this.transactions));
    }

    buildCategoryMap() {
        this.categoryMap.clear();
        this.transactions.forEach(t => {
            if (t.type === 'expense') {
                const cat = t.category || 'Others';
                this.categoryMap.set(cat, (this.categoryMap.get(cat) || 0) + t.amount);
            }
        });
    }

    // Add transaction
    addTransaction(transaction) {
        transaction.id = this.nextId++;
        this.transactions.push(transaction);
        if (transaction.type === 'expense') {
            const cat = transaction.category || 'Others';
            this.categoryMap.set(cat, (this.categoryMap.get(cat) || 0) + transaction.amount);
        }
        this.saveToStorage();
        this.checkBudgetAlert(transaction);
    }

    // Update transaction
    updateTransaction(id, updated) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            // Remove old expense from categoryMap
            const old = this.transactions[index];
            if (old.type === 'expense') {
                const oldCat = old.category || 'Others';
                const newVal = (this.categoryMap.get(oldCat) || 0) - old.amount;
                if (newVal <= 0) this.categoryMap.delete(oldCat);
                else this.categoryMap.set(oldCat, newVal);
            }
            // Update
            this.transactions[index] = { ...updated, id };
            if (updated.type === 'expense') {
                const cat = updated.category || 'Others';
                this.categoryMap.set(cat, (this.categoryMap.get(cat) || 0) + updated.amount);
            }
            this.saveToStorage();
        }
    }

    // Delete transaction
    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const removed = this.transactions[index];
            if (removed.type === 'expense') {
                const cat = removed.category || 'Others';
                const newVal = (this.categoryMap.get(cat) || 0) - removed.amount;
                if (newVal <= 0) this.categoryMap.delete(cat);
                else this.categoryMap.set(cat, newVal);
            }
            this.transactions.splice(index, 1);
            this.saveToStorage();
        }
    }

    // ---------- Sorting (QuickSort) ----------
    sortBy(key, ascending = true) {
        const arr = [...this.transactions];
        if (key === 'date') {
            arr.sort((a, b) => ascending ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
        } else if (key === 'amount') {
            arr.sort((a, b) => ascending ? a.amount - b.amount : b.amount - a.amount);
        } else if (key === 'category') {
            arr.sort((a, b) => ascending ? (a.category || '').localeCompare(b.category || '') : (b.category || '').localeCompare(a.category || ''));
        }
        return arr;
    }

    // ---------- Binary Search by Title (on sorted array) ----------
    binarySearchByTitle(title) {
        const sorted = this.sortBy('title', true);
        let left = 0, right = sorted.length - 1;
        const results = [];
        // Since titles may not be unique, we'll find first occurrence then expand
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midTitle = sorted[mid].title.toLowerCase();
            if (midTitle.includes(title.toLowerCase())) {
                // Found one, collect all around (simplified)
                return this.transactions.filter(t => t.title.toLowerCase().includes(title.toLowerCase()));
            } else if (midTitle < title.toLowerCase()) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return [];
    }

    // Get category breakdown for expenses
    getCategoryBreakdown() {
        return Object.fromEntries(this.categoryMap);
    }

    // Get last 7 days income/expense
    getLast7Days() {
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        const income = new Array(7).fill(0);
        const expense = new Array(7).fill(0);
        this.transactions.forEach(t => {
            const idx = dates.indexOf(t.date);
            if (idx !== -1) {
                if (t.type === 'income') income[idx] += t.amount;
                else expense[idx] += t.amount;
            }
        });
        return { dates, income, expense };
    }

    // Budget alert (simple threshold per category)
    checkBudgetAlert(newTransaction) {
        if (newTransaction.type !== 'expense') return;
        const category = newTransaction.category || 'Others';
        const totalSpent = this.categoryMap.get(category) || 0;
        // Define budgets (could be user-configurable)
        const budgets = { Food: 5000, Shopping: 3000, Travel: 4000, Rent: 15000, Others: 2000 };
        if (budgets[category] && totalSpent > budgets[category]) {
            showBudgetAlert(`⚠️ Budget exceeded for ${category}! Spent ₹${totalSpent} (limit ₹${budgets[category]})`);
        }
    }

    // Seed demo data
    seedDemoData() {
        const demo = [
            { title: 'Salary', amount: 60000, type: 'income', category: 'Others', date: getDate(-2) },
            { title: 'Groceries', amount: 3200, type: 'expense', category: 'Food', date: getDate(-1) },
            { title: 'Rent', amount: 12000, type: 'expense', category: 'Rent', date: getDate(-5) },
            { title: 'New Shoes', amount: 2500, type: 'expense', category: 'Shopping', date: getDate(-3) },
            { title: 'Flight', amount: 4500, type: 'expense', category: 'Travel', date: getDate(-7) },
            { title: 'Dinner out', amount: 1800, type: 'expense', category: 'Food', date: getDate(-4) },
        ];
        demo.forEach(t => {
            t.id = this.nextId++;
            this.transactions.push(t);
        });
        this.buildCategoryMap();
    }
}

function getDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() + daysAgo);
    return d.toISOString().split('T')[0];
}

// ==================== UI Logic ====================
const manager = new TransactionManager();
manager.loadFromStorage();

let editId = null; // for editing

// DOM elements
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transactionForm');
const cancelEdit = document.getElementById('cancelEdit');
const sortSelect = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');
const exportCsvBtn = document.getElementById('exportCsv');
const budgetModal = document.getElementById('budgetModal');
const budgetMessage = document.getElementById('budgetMessage');
const closeModal = document.querySelector('.close');

// Charts
let categoryChart, trendChart;

// Format currency
function formatINR(amount) {
    return '₹' + amount.toFixed(2);
}

// Update dashboard numbers
function updateDashboard() {
    const totals = manager.transactions.reduce((acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
    }, { income: 0, expense: 0 });
    totalIncomeEl.textContent = formatINR(totals.income);
    totalExpensesEl.textContent = formatINR(totals.expense);
    balanceEl.textContent = formatINR(totals.income - totals.expense);
}

// Render transactions (with optional custom list)
function renderTransactions(list = null) {
    const data = list || manager.sortBy(sortSelect.value, sortSelect.value === 'date' ? false : true); // date newest first
    if (data.length === 0) {
        transactionList.innerHTML = '<li class="empty-message">No transactions yet.</li>';
        return;
    }

    transactionList.innerHTML = '';
    data.forEach(t => {
        const li = document.createElement('li');
        const icon = t.type === 'income' ? '💰' : '🛒';
        const formattedDate = t.date.split('-').reverse().join('/');
        li.innerHTML = `
            <div class="transaction-info">
                <span class="icon">${icon}</span>
                <div class="details">
                    <span class="title">${escapeHTML(t.title)}</span>
                    <span class="category">${t.category}</span>
                    <span class="amount">${formatINR(t.amount)}</span>
                    <span class="date">${formattedDate}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="edit-btn" data-id="${t.id}">✏️</button>
                <button class="delete-btn" data-id="${t.id}">🗑️</button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    // Attach edit/delete events
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.dataset.id);
            startEdit(id);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.dataset.id);
            manager.deleteTransaction(id);
            updateDashboard();
            renderTransactions();
            updateCharts();
        });
    });
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// Start editing a transaction
function startEdit(id) {
    const t = manager.transactions.find(t => t.id === id);
    if (!t) return;
    editId = id;
    document.getElementById('title').value = t.title;
    document.getElementById('amount').value = t.amount;
    document.getElementById('type').value = t.type;
    document.getElementById('category').value = t.category;
    document.getElementById('date').value = t.date;
    cancelEdit.style.display = 'inline-block';
    form.querySelector('button[type="submit"]').textContent = 'Update Transaction';
}

// Cancel edit
cancelEdit.addEventListener('click', () => {
    editId = null;
    form.reset();
    cancelEdit.style.display = 'none';
    form.querySelector('button[type="submit"]').textContent = 'Save Transaction';
});

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!title || isNaN(amount) || amount <= 0 || !type || !category || !date) {
        alert('Please fill all fields correctly.');
        return;
    }

    const transaction = { title, amount, type, category, date };
    if (editId !== null) {
        manager.updateTransaction(editId, transaction);
        editId = null;
        cancelEdit.style.display = 'none';
        form.querySelector('button[type="submit"]').textContent = 'Save Transaction';
    } else {
        manager.addTransaction(transaction);
    }

    form.reset();
    updateDashboard();
    renderTransactions();
    updateCharts();
});

// Update charts
function updateCharts() {
    // Category pie chart
    const breakdown = manager.getCategoryBreakdown();
    const categories = Object.keys(breakdown);
    const amounts = Object.values(breakdown);

    if (categoryChart) categoryChart.destroy();
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctxCat, {
        type: 'pie',
        data: {
            labels: categories.length ? categories : ['No expenses'],
            datasets: [{
                data: categories.length ? amounts : [1],
                backgroundColor: ['#f8c8dc', '#b5ead7', '#a7c7e7', '#e8cfc1', '#c5b4e3'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { display: categories.length > 0 } } }
    });

    // Trend chart
    const { dates, income, expense } = manager.getLast7Days();
    if (trendChart) trendChart.destroy();
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctxTrend, {
        type: 'bar',
        data: {
            labels: dates.map(d => d.slice(5)),
            datasets: [
                { label: 'Income', data: income, backgroundColor: '#b5ead7' },
                { label: 'Expense', data: expense, backgroundColor: '#f8c8dc' }
            ]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

// Sort change
sortSelect.addEventListener('change', () => {
    renderTransactions(manager.sortBy(sortSelect.value, sortSelect.value === 'date' ? false : true));
});

// Search (binary search)
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) {
        renderTransactions();
        searchResult.textContent = '';
        return;
    }
    const results = manager.binarySearchByTitle(query);
    if (results.length) {
        renderTransactions(results);
        searchResult.textContent = `Found ${results.length} transaction(s).`;
    } else {
        transactionList.innerHTML = '<li class="empty-message">No matching transactions.</li>';
        searchResult.textContent = 'No results.';
    }
});

// Export CSV
exportCsvBtn.addEventListener('click', () => {
    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date'];
    const rows = manager.transactions.map(t => [t.id, t.title, t.amount, t.type, t.category, t.date]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finwise_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});

// Budget alert modal
function showBudgetAlert(msg) {
    budgetMessage.textContent = msg;
    budgetModal.style.display = 'flex';
}
closeModal.addEventListener('click', () => budgetModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === budgetModal) budgetModal.style.display = 'none'; });

// Initial render
updateDashboard();
renderTransactions();
updateCharts();

// FinWise - Frontend with API + Auth

let transactions = [];
let categoryMap = new Map();

const API_URL = 'http://localhost:5000/api';

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Helper for fetch with auth
async function authenticatedFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return null;
    }
    return response;
}

// Load transactions from API
async function loadTransactions() {
    const response = await authenticatedFetch(`${API_URL}/transactions`);
    if (response && response.ok) {
        transactions = await response.json();
        buildCategoryMap();
        updateDashboard();
        renderTransactions();
        updateCharts();
    }
}

function buildCategoryMap() {
    categoryMap.clear();
    transactions.forEach(t => {
        if (t.type === 'expense') {
            const cat = t.category || 'Others';
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
        }
    });
}

// Add transaction
async function addTransaction(transaction) {
    const response = await authenticatedFetch(`${API_URL}/transactions`, {
        method: 'POST',
        body: JSON.stringify(transaction)
    });
    if (response && response.ok) {
        const newT = await response.json();
        transactions.push(newT);
        buildCategoryMap();
        updateDashboard();
        renderTransactions();
        updateCharts();
        checkBudgetAlert(newT);
    }
}

// Update transaction
async function updateTransaction(id, updated) {
    const response = await authenticatedFetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updated)
    });
    if (response && response.ok) {
        const updatedT = await response.json();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) transactions[index] = updatedT;
        buildCategoryMap();
        updateDashboard();
        renderTransactions();
        updateCharts();
    }
}

// Delete transaction
async function deleteTransaction(id) {
    const response = await authenticatedFetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE'
    });
    if (response && response.ok) {
        transactions = transactions.filter(t => t.id !== id);
        buildCategoryMap();
        updateDashboard();
        renderTransactions();
        updateCharts();
    }
}

// ... (rest of the functions: updateDashboard, renderTransactions, etc., remain mostly the same, but they use the global `transactions` and `categoryMap`)

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Initial load
loadTransactions();