const tbName = 'CATEGORY';
const colName = ['id', 'name'];
module.exports = class CATEGORY {
    constructor(p) {
        this.id = p.id || '',
        this.name = p.name || ''
    }
}