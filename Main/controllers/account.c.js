const userModel = require('../models/user.m');

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

            // Check if username contains only letters and numbers
            const regex = /^[a-zA-Z0-9]+$/;
            if (!regex.test(username)) {
                return res.status(400).json({ message: 'Username must contain only letters and numbers!' });
            }

            // Check if username existed
            const existedUser = await userModel.getUser(username);
            if (existedUser) {
                return res.status(401).json({ message: 'Username already exists, please choose another username!' });
            }

            // Check if password and retypepassword match
            if (password !== retypepassword) {
                return res.status(402).json({ message: 'Your password and confirmation password do not match!' });
            }

            // Add user to database
            const user = {
                username: username,
                password: password,
                email: email,
                name: name
            }
            const result = await userModel.addUser(user);
            
            // TODO: Fetch id and balance to Payment server: id = result[0].id
            // console log result: [ { id: 4 } ]

            // Return result
            if (result) {
                res.status(200).json({ message: 'Register successfully!' });
            } 
            else {
                res.status(400).json({ message: 'Register failed, please try again!' });
            }
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }
};