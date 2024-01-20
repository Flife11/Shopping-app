const db = require('../utilities/db');

module.exports = {
    getAll: async () => {
        try {
            const sql = `SELECT * FROM "SUBCATEGORY"`;
            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
    getSubcategory: async (id) => {
        try {
            const sql = `SELECT * FROM "SUBCATEGORY" WHERE id = ${id}`;
            const result = await db.db.oneOrNone(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
}