const db = require('../utilities/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
    getUser: async (username) => {
        try {
            const sql = `SELECT * FROM "USER" WHERE username = '${username}'`;
            const result = await db.db.oneOrNone(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },

    addUser: async (user) => {
        try {
            const hashPassword = await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS));
            user.password = hashPassword;

            const sql = `INSERT INTO "USER" (username, password, name, email, role) VALUES ('${user.username}', '${user.password}', '${user.name}', '${user.email}', 'client') RETURNING id`;

            // Note: execute query that can return insertedId

            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
}