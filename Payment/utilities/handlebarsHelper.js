const Handlebars = require('handlebars');

Handlebars.registerHelper('ifEquals', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

module.exports = Handlebars;