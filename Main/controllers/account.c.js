const jwt = require('jsonwebtoken');

const userModel = require('../models/user.m');
const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');
const secret = process.env.JWT_SECRET;

module.exports = {
    getLogin: async function (req, res) {
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        res.render('login', { title: 'Đăng nhập', categories: categories, subcategories: subcategories });
    },
    getRegister: async function (req, res) {
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        res.render('register', { title: 'Đăng ký', categories: categories, subcategories: subcategories });
    },
    postRegister: async function (req, res) {
        try {
            const { username, password, retypepassword, email, name } = req.body;

            // Check if username contains only letters, numbers, underscore and dot
            const regex = /^[a-zA-Z0-9_.]+$/;
            if (!regex.test(username)) {
                return res.status(401).json({ message: 'Tên đăng nhập chỉ chứa số, chữ, dấu gạch dưới (_) và dấu chấm (.)!' });
            }

            // Check if username existed
            const existedUser = await userModel.getUser(username);
            if (existedUser) {
                return res.status(401).json({ message: 'Tên đăng nhập đã tồn tại, hãy chọn một tên đăng nhập khác nhé!' });
            }

            // Check if email is valid
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                return res.status(403).json({ message: 'Email không hợp lệ!' });
            }


            // Check if password and retypepassword match
            if (password !== retypepassword) {
                return res.status(402).json({ message: 'Mật khẩu không khớp, nhập lại nha!' });
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
                res.status(200).json({ message: 'Đăng ký thành công!' });
            }
            else {
                res.status(400).json({ message: 'Đăng ký thất bại, thử lại sau nha!' });
            }
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    renderGoogleLogin: (req, res) => {
        const urlGG = process.env.URLGG;
        const client_id = process.env.CLIENT_ID;
        const redirect_uri = process.env.REDIRECT_URI;
        const response_type = process.env.RESPONSE_TYPE;
        const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
        const queries = new URLSearchParams({
            response_type,
            redirect_uri,
            client_id,
            scope: scopes.join(' '),
        });
        
        res.redirect(`${urlGG}?${queries.toString()}`);
    },
    authGoogle: async function (req, res) {
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;
        const redirect_uri = process.env.REDIRECT_URI;
        const grant_type = process.env.GRANT_TYPE;
        const code = req.query.code;
        const options = {
            code,
            grant_type,
            client_id,
            client_secret,
            redirect_uri
        }
        const rs = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(options)
        })

        // Receive data from Google and decode
        const data = await rs.json()
        const user = await jwt.decode(data.id_token);
        
        // Check if user existed
        let existedUser = await userModel.getUser(user.email);
        let newUser = {};
        let randomPassword = Math.random().toString(36).slice(-8);

        // If not, add user to database
        if (!existedUser) {
            newUser = {
                username: user.email,
                password: randomPassword,
                name: user.name,
                email: user.email,
                role: 'client'
            }
            await userModel.addUser(newUser);
        }
        else {
            newUser = existedUser;
        }

        // Create token
        const token = jwt.sign(newUser, secret, { expiresIn: 24 * 60 * 60 });
        res.redirect('/account/assignpassportGoogle?token=' + token);
    },
};