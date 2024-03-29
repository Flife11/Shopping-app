const db = require('../utilities/db');
const tableName='TRANSACTION'
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
    insert:async(transaction)=>{
        try{
            const sql = `INSERT INTO "${tableName}"(userid,date,orderid,amount,currentbalance) VALUES(${transaction.iduser},'${transaction.date}',${transaction.idorder},${transaction.amount},${transaction.currentbalance})`;
            // console.log(sql);
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
}