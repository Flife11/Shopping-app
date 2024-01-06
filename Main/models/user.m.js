const db = require('../utilities/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
    getUser: async (username) => {
        const sql = `SELECT * FROM "USER" WHERE username = '${username}'`;
        const result = await db.queryOne(sql);
        return result;
    },

    addUser: async (user) => {
        const hashPassword = await bcrypt.hash(user.password, process.env.SALT_ROUNDS);
        user.password = hashPassword;

        const sql = `INSERT INTO "USER" (username, password, name, email, role) VALUES ('${user.username}', '${user.password}', '${user.name}', '${user.email}', 'client')`;
        
        // Note: execute query that can return insertedId

        const result = await db.query(sql);
        return result;
    },
}