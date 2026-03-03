const { execute } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const result = await execute(
            `SELECT * FROM users WHERE email = :email`,
            [email]
        );
        const user = result.rows[0];

        console.log('Retrieved user:', user); // 👈 Log the whole object

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if password_hash exists
        if (!user.PASSWORD_HASH) {
            console.error('password_hash is missing or undefined');
            return res.status(500).json({ error: 'Stored hash not found' });
        }

        console.log('Hash from DB:', user.PASSWORD_HASH); // 👈 Log the hash
        console.log('Hash length:', user.PASSWORD_HASH.length);

        const valid = await bcrypt.compare(password, user.PASSWORD_HASH);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.ID, name: user.NAME, email: user.EMAIL }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};