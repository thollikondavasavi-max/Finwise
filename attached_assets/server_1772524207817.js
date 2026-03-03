require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initialize } = require('./db');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database pool
initialize().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Database initialization failed', err);
    process.exit(1);
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/transactions', authMiddleware, transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});