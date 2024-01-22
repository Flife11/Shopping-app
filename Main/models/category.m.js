const db = require('../utilities/db');

module.exports = {
    getCategories : async function (search) {
        let sql = `SELECT * FROM "CATEGORY" WHERE 1=1`;        
        if (search) 
            sql += ` AND LOWER(name) LIKE '%${search.toLowerCase()}%'`;
        
        const result = await db.db.query(sql);

        return result;
    },

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

    delete: async function(listID) {
        db.delete("CATEGORY", listID);
    },

    insert: async function(name) {
        let id = await db.db.query('SELECT MAX(id) AS m FROM "CATEGORY"')
        db.insert("CATEGORY", ['id', 'name'], 
        [{id: id[0].m+1, name}]);
    },

    update: async function(id, name) {        
        db.update("CATEGORY", ['name'], 
        [{name}], `WHERE id=${id}`);             
    },
}