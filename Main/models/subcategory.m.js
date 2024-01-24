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

    delete: async function(listID) {
        db.delete("SUBCATEGORY", listID);
    },

    insert: async function(name, catid) {
        let id = await db.db.query('SELECT MAX(id) AS m FROM "SUBCATEGORY"')
        db.insert("SUBCATEGORY", ['id', 'name', 'catid'], 
        [{id: id[0].m+1, name, catid}]);            
    },

    getSubcategories : async function (search) {
        let sql = `SELECT * FROM "SUBCATEGORY" WHERE 1=1`;        
        if (search) 
            sql += ` AND LOWER(name) LIKE '%${search.toLowerCase()}%'`;
        
        const result = await db.db.query(sql);

        return result;
    },

    update: async function(id, name, catid) {        
        db.update("SUBCATEGORY", ['name', 'catid'], 
        [{name, catid}], `WHERE id=${id}`);             
    },

    checkExist: async function(name, category) {
        try {
            const sql = `SELECT * FROM "SUBCATEGORY" WHERE name = '${name}' and catid=${category}`;
            const result = await db.db.oneOrNone(sql);
            return result;
        } catch (error) {
            throw(error);
        }
    }
}