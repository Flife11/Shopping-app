const db = require('../utilities/db');

module.exports = {

    getProducts : async function (catid, subcatid, search) {
        let sql = `SELECT * FROM "PRODUCT" WHERE 1=1`;
        if (catid != -1)
            sql += ` AND catid = ${catid}`;
        if (subcatid != -1) 
            sql += ` AND subcatid = ${subcatid}`;        
        if (search) 
            sql += ` AND LOWER(name) LIKE '%${search.toLowerCase()}%'`;
        
        const result = await db.db.query(sql);

        return result;
    },

    getAll : async function () {
        const result = await db.db.query(`SELECT * FROM "PRODUCT"`);
        return result;
    },
    getProduct : async function (id) {
        const result = await db.db.oneOrNone(`SELECT * FROM "PRODUCT" WHERE id = ${id}`);
        return result;
    },

    // getByOffset: async function(search, offset, limit) {
    //     let condition = 'WHERE 1=1';
    //     if (search) condition += ` AND LOWER(name) LIKE '%${search.toLowerCase()}%'`;
    //     const data = await db.getByOffset('PRODUCT', offset, condition, limit, search);
    //     return data;
    // },

    getOne : async function(id) {
        const result = await db.db.query(`SELECT * FROM "PRODUCT" WHERE id = ${id}`);
        return result;
    },

    delete: async function(listID) {
        db.delete("PRODUCT", listID);
    }
}