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
    }
}