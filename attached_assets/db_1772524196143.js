const oracledb = require('oracledb');
require('dotenv').config();

// Optional: enable auto commit for each execute
oracledb.autoCommit = true;

async function initialize() {
    // Create a connection pool (recommended)
    console.log("USER:", process.env.ORACLE_USER);
    console.log("PASS:", process.env.ORACLE_PASSWORD);
    console.log("CONN:", process.env.ORACLE_CONNECTION_STRING);

    await oracledb.createPool({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECTION_STRING,
        poolMin: 1,
        poolMax: 5
    });
    console.log('Oracle pool created');
}

// Execute a SQL statement with parameters
async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, options);
        return result;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

module.exports = { initialize, execute };