
module.exports = {
    getLogin(req, res) {
        res.render('login', {title: 'Login'});
    },
    getRegister(req, res) {
        res.render('register', {title: 'Register'});
    }
};