
module.exports = {
    getLogin(req, res) {
        res.render('login', { title: 'Login' });
    },
    getRegister(req, res) {
        res.render('register', { title: 'Register' });
    },
    postRegister: async function (req, res) {
        try {
            const { username, password, retypepassword, email, name } = req.body;
            if (password !== retypepassword) {
                return res.status(400).json({ message: 'Your password and confirmation password do not match, please try again!' });
            }

            const existedUser = await userModel.getUser(username);
            if (existedUser) {
                return res.status(400).json({ message: 'Username already exists, please choose another username!' });
            }

            const user = {
                username: username,
                password: password,
                email: email,
                name: name
            }
            const result = await userModel.addUser(user);
            console.log(result);

            if (result) {
                res.status(200).json({ message: 'Register successfully, you can back to login page and use this account now~' });
            } else {
                res.status(400).json({ message: 'Register failed, please try again!' });
            }
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }
};