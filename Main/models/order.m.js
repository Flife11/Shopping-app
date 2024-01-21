const db = require('../utilities/db');

module.exports = {
    getByUserID: async function (userid) {
        const result = await db.db.query(`SELECT * FROM "ORDER" WHERE userid = ${userid}`);
        return result;
    }
}