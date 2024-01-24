const { parse } = require('handlebars');
const db = require('../utilities/db');

module.exports = {
    getByUserID: async function (userid) {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE userid = ${userid}`);
        return result;
    },
    insert: async function (userid, date, total, name, address, email) {
        const result = await db.db.query(`INSERT INTO "ORDER" (userid, date, total, name, address, email) VALUES (${userid}, '${date}', ${total}, '${name}', '${address}', '${email}')`);
        return result;
    },
    getId: async function (userid, date, total) {
        const result = await db.db.query(`SELECT id FROM "ORDER" WHERE userid = ${userid} AND date = '${date}' AND total = ${total}`);
        return result[0].id;
    },
    getByID: async function (id) {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE id = ${id}`);
        return result[0];
    },
    getAllDate: async function (dateFrom,dateTo) {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE "date" BETWEEN '${dateFrom}' AND '${dateTo}'; `);
        return result;
    }
}