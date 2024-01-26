const { use } = require('passport');
const db = require('../utilities/db');
const tableName='USER'
module.exports = {
    getAll: async () => {
        try {
            const sql = `SELECT * FROM "${tableName}"`;
            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
    insert:async(user)=>{
        try{
            const sql = `INSERT INTO "${tableName}"("id", "balance") VALUES(${user.iduser},${user.balance})ON CONFLICT (id) DO NOTHING;`;
            const result = await db.db.query(sql);
        }
        catch (error) {
            console.log(error);
        }
    },
    getCondition: async (columb, value) => {
        try {
            const sql = `SELECT * FROM "${tableName}" WHERE "${columb}"=${value}`;
            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },
    update: async (columCodition,codition,columb, value) => {
        try {
            const sql = `Update "${tableName}"  SET "${columb}"=${value} WHERE "${columCodition}"=${codition}`;
            const result = await db.db.query(sql);
            return result;
        } catch (error) {
            console.log(error);
        }
    },

    delete: async (listID) => {
        try {
            if (listID || listID!=undefined) {
                const query = `DELETE FROM "USER" WHERE id IN (${listID.join()})`;
                const data = await db.db.any(query);
                return data;
            }
        } catch (error) {
            throw error
        }
    },
}