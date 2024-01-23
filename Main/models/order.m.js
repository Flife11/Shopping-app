const { parse } = require('handlebars');
const db = require('../utilities/db');

module.exports = {
    getByUserID: async function (userid) {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE userid = ${userid}`);
        return result;
    },
    insert: async function (userid, date, total) {
        const result = await db.db.query(`INSERT INTO "ORDER" (userid, date, total) VALUES (${userid}, '${date}', ${total})`);
        return result;
    },
    getId: async function (userid, date, total) {
        const result = await db.db.query(`SELECT id FROM "ORDER" WHERE userid = ${userid} AND date = '${date}' AND total = ${total}`);
        return result[0].id;
    },
    getAllMonthYear: async function () {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE EXTRACT(MONTH FROM "date") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM "date") = EXTRACT(YEAR FROM CURRENT_DATE); `);
        return result;
    }
}