const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userModel = require('../models/user.m');
const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');
const orderModel = require('../models/order.m');
const corsHelper = require('../utilities/corsHelper');
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
            const { username, password, retypepassword, email, address, name } = req.body;

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
                address: address,
                name: name
            }
            const result = await userModel.addUser(user);

            // Fetch id to Payment server: id = result[0].id to add user in Payment server
            // console log result: [ { id: 4 } ]

            const corsToken = await corsHelper.generateCorsToken(req);

            try {
                let iduser = result[0].id;
                let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 });
                let data = { token: token };
                let PaymentURL = process.env.PAYMENT_URL;
                let rs = await fetch(PaymentURL + '/createuser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': corsToken,
                    },
                    body: JSON.stringify(data)
                })
                let rsData = await rs.json();
                if (!rs.ok) {
                    return res.status(500).json({ message: rsData.message });
                }
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

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
                address: 'Thành phố Hồ Chí Minh',
                role: 'client'
            }
            const result = await userModel.addUser(newUser);

            // Add user's id to newUser
            let iduser = result[0].id;
            newUser.id = iduser;

            // Fetch to /createuser (Payment server) user.id (by token) to add user in Payment server
            let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 });
            let data = { token: token };
            let PaymentURL = process.env.PAYMENT_URL;
            const corsToken = await corsHelper.generateCorsToken(req);
            let rs = await fetch(PaymentURL + '/createuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': corsToken,
                },
                body: JSON.stringify(data)
            })
            let rsData = await rs.json();
            if (!rs.ok) {
                return res.status(500).json({ message: rsData.message });
            }
        }
        else {
            newUser = existedUser;
        }

        // Create token
        const token = jwt.sign(newUser, secret, { expiresIn: 24 * 60 * 60 });
        res.redirect('/account/assignpassportGoogle?token=' + token);
    },
    getAddfund: async function (req, res) {

        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();

        res.render('addfund', { title: 'Nạp tiền', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },
    postAddfund: async function (req, res) {

        //Get user from session
        user = req.session.passport.user;

        //Get data from client
        const data = req.body;

        // Get userData with username
        const userData = await userModel.getUser(user.username);

        //Get Date
        var checkSuccess = true;
        const timestamp = Date.now();

        const dateWithoutTimeZone = new Date(timestamp);

        const year = dateWithoutTimeZone.getFullYear();
        const month = dateWithoutTimeZone.getMonth() + 1;
        const day = dateWithoutTimeZone.getDate();
        const hours = dateWithoutTimeZone.getHours();
        const minutes = dateWithoutTimeZone.getMinutes();
        const seconds = dateWithoutTimeZone.getSeconds();

        const formattedDateWithoutTimeZone = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        //Create Data Send
        const dataSend = {
            iduser: userData.id,
            date: formattedDateWithoutTimeZone,
            idorder: null,
            amount: data.amount,
        }
        let token = jwt.sign(dataSend, secret, { expiresIn: 24 * 60 * 60 });
        const dataAddFund = { token: token };
        let PaymentURL = process.env.PAYMENT_URL;

        const corsToken = await corsHelper.generateCorsToken(req);
        let rs = await fetch(PaymentURL + '/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': corsToken,
            },
            body: JSON.stringify(dataAddFund)
        })
        let rsData = await rs.json();

        if (!rs.ok) {
            checkSuccess = false;
        }
        if (checkSuccess) {
            req.session.passport.user.balance = parseFloat(req.session.passport.user.balance) + parseFloat(data.amount);
            res.status(200).json({ message: rsData.message });
        }
        else {
            res.status(500).json({ message: rsData.message });
        }

    },

    getAccount: async function (req, res) {

        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        const orders = await orderModel.getByUserID(user.id);
        const orderscount = orders.length;

        res.render('account', { title: 'Tài khoản', categories: categories, subcategories: subcategories, orderscount: orderscount, isLoggedin: req.isAuthenticated(), user: user });
    },

    getEditprofile: async function (req, res) {
        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();

        res.render('editprofile', { title: 'Chỉnh sửa thông tin', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },

    postEditprofile: async function (req, res) {
        try {
            const { name, address, email } = req.body;

            // Check if email is valid
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                return res.status(403).json({ message: 'Email không hợp lệ!' });
            }

            // Update user in database and passport
            let user = {
                id: req.session.passport.user.id,
                name: name,
                address: address,
                email: email
            }           

            await userModel.editUser(user);

            req.session.passport.user.name = name;
            req.session.passport.user.address = address;
            req.session.passport.user.email = email;
            
            res.status(200).json({ message: 'Chỉnh sửa thông tin thành công!' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
        }
    },

    getEditpassword: async function (req, res) {
        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();

        res.render('editpassword', { title: 'Đổi mật khẩu', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },

    postEditpassword: async function (req, res) {
        try {
            const { oldpassword, password, retypepassword } = req.body;

            // Check if old password is correct
            const user = await userModel.getUser(req.session.passport.user.username);
            const auth = await bcrypt.compare(oldpassword, user.password);
            if (!auth) {
                return res.status(401).json({ message: 'Mật khẩu cũ không đúng!' });
            }

            // Check if password and retypepassword match
            if (password !== retypepassword) {
                return res.status(402).json({ message: 'Mật khẩu mới không khớp, nhập lại nha!' });
            }            

            // Update user in database and passport
            let newUser = {
                id: req.session.passport.user.id,
                password: password
            }
            await userModel.editUser(newUser); // necessary to update password passport? no >:(

            // Send success message to res
            res.status(200).json({ message: 'Đổi mật khẩu thành công!' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
        }
    },
};