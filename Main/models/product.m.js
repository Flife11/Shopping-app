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

    getByOffset: async function(offset, limit) {
        const data = await db.getByOffset('PRODUCT', offset, '', limit);
        return data;
    },

    countRecord: async function() {
        const cnt = await db.db.query('SELECT COUNT(*) as cnt FROM "PRODUCT"');        
        return cnt[0].cnt;
    },

    getOne : async function (id) {
        const result = await db.db.query(`SELECT * FROM "PRODUCT" WHERE id = ${id}`);
        return result;
    },

}