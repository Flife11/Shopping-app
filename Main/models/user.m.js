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

            const sql = `INSERT INTO "USER" (username, password, name, email, address, role) VALUES ('${user.username}', '${user.password}', '${user.name}', '${user.email}', '${user.address}', 'client') RETURNING id`;

            // Note: execute query that can return insertedId

            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },

    editUser: async (user) => {
        try {
            let sql = `UPDATE "USER" SET `;

            // check which field is not null
            if (user.name) {
                sql += `name = '${user.name}', `;
            }
            if (user.email) {
                sql += `email = '${user.email}', `;
            }
            if (user.address) {
                sql += `address = '${user.address}', `;
            }
            if (user.password) {
                const hashPassword = await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS));
                sql += `password = '${hashPassword}', `;
            }
            if (user.role) {
                sql += `role = '${user.role}', `;
            }

            // remove last comma
            sql = sql.slice(0, -2);

            // add where clause
            sql += ` WHERE id = ${user.id}`;

            // execute query
            const result = await db.db.query(sql);
            return result;

        } catch (error) {
            console.log(error);
        }
    }
}