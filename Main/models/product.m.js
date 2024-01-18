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

}