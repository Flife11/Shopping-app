const Handlebars = require('handlebars');

Handlebars.registerHelper('ifEquals', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('subtract', function (a, b) {
    return a - b;
});
Handlebars.registerHelper('equals', function (a, b) {
    return a == b;
});
    
module.exports = Handlebars;