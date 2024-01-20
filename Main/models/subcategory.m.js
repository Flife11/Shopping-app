const tbName = 'SUBCATEGORY';
const colName = ['id', 'catid', 'name'];
module.exports = class SUBCATEGORY {
    constructor(p) {
        this.id = p.id || "",
        this.catid = p.catid || "",
        this.name = p.name || ""
    }
}