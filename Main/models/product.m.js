const db = require('../utilities/db');
const tbName = 'PRODUCT';
const colName = ['id', 'catid', 'subcatid', 'name', 'price', 'quantity', 'image', 'shortdescription', 'fulldescription'];
module.exports = class PRODUCT {
    constructor(p) {
        this.id = p.id || '',
        this.catid = p.catid || '',
        this.subcatid = p.subcatid || '',
        this.name = p.name || '',
        this.price = p.price || '',
        this.quantity = p.quantity || '',
        this.image = p.image || '',
        this.shortdescription = p.shortdescription || '',
        this.fulldescription = p.fulldescription || ''
    }

    static async getProductTotalRows()  {
        try {
            var query = 'SELECT COUNT(*) AS cnt FROM "Products"';
            const total = await db.query(query);
            return total;
        } catch (error) {
            throw(error);
        }
    }

    static async getProduct() {
        
    }
}