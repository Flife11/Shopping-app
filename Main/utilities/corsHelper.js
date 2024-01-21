const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports = {
    generateCorsToken: function (req) {
        // Get URL
        let url = req.protocol + '://' + req.get('host');

        // Generate token
        let token = jwt.sign({ url:url }, secret, { expiresIn: 24 * 60 * 60 });

        // Return token
        return token;
    }
}