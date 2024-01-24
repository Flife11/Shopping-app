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
    },

    insert: async function(name, price, quantity, catid, subcatid=null, shortdes, longdes) {
        let id = await db.db.query('SELECT MAX(id) AS m FROM "PRODUCT"')
        let newid = await db.insert("PRODUCT", ['id', 'name', 'price', 'quantity', 'catid', 'subcatid', 'shortdescription', 'fulldescription'], 
        [{id: id[0].m+1, name, price, quantity, catid, subcatid, "shortdescription": shortdes, "fulldescription": longdes}]);
        db.update("PRODUCT", ['image'], [{image: `${newid[0].id}.jpg`}], `WHERE id=${newid[0].id}`);
        return newid[0].id;
    },

    update: async function(id, name, price, quantity, catid, subcatid=null, shortdescription, fulldescription) {        
        if (isNaN(subcatid)) {
            db.update("PRODUCT", ['name', 'price', 'quantity', 'catid', 'shortdescription', 'fulldescription'], 
            [{name, price, quantity, catid, shortdescription, fulldescription}], `WHERE id=${id}`);             
        } else {
            db.update("PRODUCT", ['name', 'price', 'quantity', 'catid', 'subcatid', 'shortdescription', 'fulldescription'], 
            [{name, price, quantity, catid, subcatid, shortdescription, fulldescription}], `WHERE id=${id}`);             
        }
    },
}