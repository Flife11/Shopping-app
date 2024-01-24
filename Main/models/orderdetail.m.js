const { parse } = require('handlebars');
const db = require('../utilities/db');

module.exports = {
    insert: async function (orderid, productid, quantity, price, total) {
        const result = await db.db.query(`INSERT INTO "ORDERDETAIL" (orderid, productid, quantity, price, total) VALUES (${orderid}, ${productid}, ${quantity}, ${price}, ${total})`);
        return result;
    },
    getByOrderID: async function (orderid) {
        const result = await db.db.query(`SELECT * FROM "ORDERDETAIL" WHERE orderid = ${orderid}`);
        return result;
    },
    getSumProductInOrder: async function(dateFrom,dateTo)
    {
        const result= await db.db.query(`select "CATEGORY"."name",SUM("ORDERDETAIL"."quantity")  
                                        from "ORDER" JOIN "ORDERDETAIL" on "ORDER"."id"= "ORDERDETAIL"."orderid"
                                        JOIN "PRODUCT" on "ORDERDETAIL"."productid"= "PRODUCT"."id"
                                        JOIN "CATEGORY" on "PRODUCT"."catid"= "CATEGORY"."id"
                                        WHERE "ORDER"."date" BETWEEN '${dateFrom}' AND '${dateTo}'
                                        GROUP BY "CATEGORY"."name";`);
        return result;
    }
}