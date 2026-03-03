const { execute } = require('../db');

// Get all transactions
exports.getTransactions = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await execute(
            `SELECT * FROM transactions WHERE user_id = :userId ORDER BY date DESC`,
            [userId]
        );
        // Convert column names to lowercase if desired, or keep as is
        const transactions = result.rows.map(row => ({
            id: row.ID,
            user_id: row.USER_ID,
            title: row.TITLE,
            amount: row.AMOUNT,
            type: row.TYPE,
            category: row.CATEGORY,
            date: row.DATE,
            created_at: row.CREATED_AT
        }));
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add transaction
exports.addTransaction = async (req, res) => {
    const userId = req.user.id;
    const { title, amount, type, category, date } = req.body;

    if (!title || !amount || !type || !category || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Insert and then fetch the new record
        await execute(
            `INSERT INTO transactions (user_id, title, amount, type, category, date) 
             VALUES (:userId, :title, :amount, :type, :category, TO_DATE(:date, 'YYYY-MM-DD'))`,
            [userId, title, amount, type, category, date]
        );

        // Fetch the inserted transaction (by combination of fields – you may use RETURNING in Oracle 12c+ but for 11g we query by last inserted)
        // A simpler approach: use a sequence and then query by ID (but we need the ID). We'll use a workaround: get the ID from a sequence before insert and then insert with that ID.
        // Better: use a PL/SQL block with RETURNING. For simplicity, we'll query the last inserted row based on date and user.
        // This is not perfect but acceptable for demo. Alternatively, generate ID from sequence manually.
        // Let's implement a more robust method: get nextval from sequence, insert, then query by that ID.
        const seqResult = await execute(`SELECT transactions_seq.NEXTVAL AS id FROM dual`, []);
        const newId = seqResult.rows[0].ID;

        await execute(
            `INSERT INTO transactions (id, user_id, title, amount, type, category, date) 
             VALUES (:id, :userId, :title, :amount, :type, :category, TO_DATE(:date, 'YYYY-MM-DD'))`,
            [newId, userId, title, amount, type, category, date]
        );

        const newTransaction = {
            id: newId,
            user_id: userId,
            title,
            amount,
            type,
            category,
            date
        };
        res.status(201).json(newTransaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, amount, type, category, date } = req.body;

    try {
        // Check ownership
        const check = await execute(
            `SELECT * FROM transactions WHERE id = :id AND user_id = :userId`,
            [id, userId]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        await execute(
            `UPDATE transactions 
             SET title = :title, amount = :amount, type = :type, category = :category, date = TO_DATE(:date, 'YYYY-MM-DD')
             WHERE id = :id`,
            [title, amount, type, category, date, id]
        );

        const updated = {
            id: Number(id),
            user_id: userId,
            title,
            amount,
            type,
            category,
            date
        };
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await execute(
            `DELETE FROM transactions WHERE id = :id AND user_id = :userId`,
            [id, userId]
        );
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};