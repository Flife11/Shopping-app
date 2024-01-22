const { parse } = require('handlebars');
const db = require('../utilities/db');

module.exports = {
    insert: async function (orderid, productid, quantity, price, total) {
        const result = await db.db.query(`INSERT INTO "ORDERDETAIL" (orderid, productid, quantity, price, total) VALUES (${orderid}, ${productid}, ${quantity}, ${price}, ${total})`);
        return result;
    },
}