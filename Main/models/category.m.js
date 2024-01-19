const db = require('../utilities/db');

module.exports = {
    getAll: async () => {
        try {
            const sql = `SELECT * FROM "CATEGORY"`;
            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
    getCategory: async (id) => {
        try {
            const sql = `SELECT * FROM "CATEGORY" WHERE id = ${id}`;
            const result = await db.db.oneOrNone(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },

}