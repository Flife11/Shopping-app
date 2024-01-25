const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { checkConnection } = require('../middleware/checkConnect2Server');
const userModel = require('../models/user.m');
const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');
const orderModel = require('../models/order.m');
const orderdetailModel = require('../models/orderdetail.m');
const productModel = require('../models/product.m');
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

            console.log(retypepassword);
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
            // Code to check `Connection from Server Main to Server Payment
            // Please add the code below to test the connection before sending any fetch to the Payment Server
            try {
                const result = await checkConnection();
                // console.log(result);
                // if connection is successful => result = true,  else => result = false;
                if (!result) {
                    res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                    return;
                }
            }
            catch (error) {
                console.log(error);
            }
            ///////////////////////////

            const corsToken = await corsHelper.generateCorsToken(req); // token to verify cors

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

            // Code to check `Connection from Server Main to Server Payment
            // Please add the code below to test the connection before sending any fetch to the Payment Server
            try {
                const result = await checkConnection();
                // console.log(result);
                // if connection is successful => result = true,  else => result = false;
                if (!result) {
                    res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                    return;
                }
            }
            catch (error) {
                console.log(error);
            }
            ///////////////////////////
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

        // Code to check `Connection from Server Main to Server Payment
        // Please add the code below to test the connection before sending any fetch to the Payment Server
        try {
            const result = await checkConnection();
            // console.log(result);
            // if connection is successful => result = true,  else => result = false;
            if (!result) {
                res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                return;
            }
        }
        catch (error) {
            console.log(error);
        }
        ///////////////////////////

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

        // Code to check `Connection from Server Main to Server Payment
        // Please add the code below to test the connection before sending any fetch to the Payment Server
        try {
            const result = await checkConnection();
            // console.log(result);
            // if connection is successful => result = true,  else => result = false;
            if (!result) {
                res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                return;
            }
        }
        catch (error) {
            console.log(error);
        }
        ///////////////////////////
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

    getOrders: async function (req, res) {
        try {
            //Get necessary data
            user = req.session.passport.user;
            const categories = await categoryModel.getAll();
            const subcategories = await subcategoryModel.getAll();

            // Fetch to /historypayment (Payment server) user.id (by token) to get transaction

            // Code to check `Connection from Server Main to Server Payment
            // Please add the code below to test the connection before sending any fetch to the Payment Server
            try {
                const result = await checkConnection();
                // console.log(result);
                // if connection is successful => result = true,  else => result = false;
                if (!result) {
                    res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                    return;
                }
            }
            catch (error) {
                console.log(error);
            }
            ///////////////////////////
            let corsToken = await corsHelper.generateCorsToken(req); // token to verify cors

            let iduser = user.id;
            let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 }); // token include iduser to send to Payment server

            let data = { token: token };
            let PaymentURL = process.env.PAYMENT_URL;
            let rs = await fetch(PaymentURL + '/historypayment', {
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

            let returnToken = rsData.token;
            let returnData = jwt.verify(returnToken, secret);

            let transactions = returnData.history;

            // Sort transaction by date
            transactions.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            // Calculate total paid and total deposit
            let totalpaid = 0.00;
            let totaldeposit = 0.00;

            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].orderid === null) {
                    totaldeposit += parseFloat(transactions[i].amount);
                }
                else {
                    totalpaid += parseFloat(transactions[i].amount);
                }
            }

            // Pagination
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const perpage = req.query.perpage ? parseInt(req.query.perpage) : 4;
            const total_page = Math.ceil(transactions.length / perpage);
            const pre_page = page - 1 > 0 ? page - 1 : 1;
            const next_page = page + 1 <= total_page ? page + 1 : total_page;
            transactions = transactions.slice((page - 1) * perpage, page * perpage);

            res.render('orders', { title: 'Lịch sử thanh toán', categories: categories, subcategories: subcategories, transactions: transactions, totaldeposit: totaldeposit, totalpaid: totalpaid, isLoggedin: req.isAuthenticated(), user: user, total_page: total_page, next_page: next_page, pre_page: pre_page, page: page });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error });
        }
    },

    getCheckout: async function (req, res) {
        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();

        res.render('checkout', { title: 'Thanh toán', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },

    postCheckout: async function (req, res) {

        try {
            //Get user
            user = req.session.passport.user;
            const userData = await userModel.getUser(user.username);

            //Get amount and userInfor
            const amount = req.body.amount;
            const userinfo = req.body.user;

            //Get Date  
            const timestamp = Date.now();
            const dateWithoutTimeZone = new Date(timestamp);
            const year = dateWithoutTimeZone.getFullYear();
            const month = dateWithoutTimeZone.getMonth() + 1;
            const day = dateWithoutTimeZone.getDate();
            const hours = dateWithoutTimeZone.getHours();
            const minutes = dateWithoutTimeZone.getMinutes();
            const seconds = dateWithoutTimeZone.getSeconds();
            const formattedDateWithoutTimeZone = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            // Insert order
            await orderModel.insert(userData.id, formattedDateWithoutTimeZone, amount, userinfo.name, userinfo.address, userinfo.email);
            const idorder = await orderModel.getId(userData.id, formattedDateWithoutTimeZone, amount);

            // Insert order detail
            const cart = req.body.cart;
            const products = [];
            for (let i = 0; i < cart.length; i++) {
                const product = await productModel.getProduct(cart[i].id);
                products.push(product);
                await orderdetailModel.insert(idorder, cart[i].id, cart[i].quantity, products[i].price, cart[i].quantity * products[i].price);
            }

            // Update quantity of products
            for (let i = 0; i < cart.length; i++) {
                const product = await productModel.getProduct(cart[i].id);
                await productModel.updateQuantity(cart[i].id, product.quantity - cart[i].quantity);
            }

            //Create Data Send to /payment Payment server
            const dataSend = {
                iduser: userData.id,
                date: formattedDateWithoutTimeZone,
                idorder: idorder,
                amount: amount,
            }
            let token = jwt.sign(dataSend, secret, { expiresIn: 24 * 60 * 60 });
            const dataAddFund = { token: token };
            let PaymentURL = process.env.PAYMENT_URL;

            // Fetch to Payment server to pay at Payment server
            // Code to check `Connection from Server Main to Server Payment
            // Please add the code below to test the connection before sending any fetch to the Payment Server
            try {
                const result = await checkConnection();
                // console.log(result);
                // if connection is successful => result = true,  else => result = false;
                if (!result) {
                    res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                    return;
                }
            }
            catch (error) {
                console.log(error);
            }
            ///////////////////////////
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

            if (rs.ok) {

                // Fetch to /getbalance (Payment server) user.id (by token) and assign to req.session.passport.user.balance
                let iduser = user.id;
                let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 });
                let data = { token: token };

                let PaymentURL = process.env.PAYMENT_URL;
                // Code to check `Connection from Server Main to Server Payment
                // Please add the code below to test the connection before sending any fetch to the Payment Server
                try {
                    const result = await checkConnection();
                    // console.log(result);
                    // if connection is successful => result = true,  else => result = false;
                    if (!result) {
                        res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                        return;
                    }
                }
                catch (error) {
                    console.log(error);
                }
                ///////////////////////////
                const corsToken = await corsHelper.generateCorsToken(req);
                let rs = await fetch(PaymentURL + '/getbalance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': corsToken,
                    },
                    body: JSON.stringify(data)
                });
                let balancersData = await rs.json();
                if (!rs.ok) {
                    return res.status(501).json({ message: balancersData.message })
                }
                let balanceToken = balancersData.token;
                let balanceData = jwt.verify(balanceToken, secret);
                req.session.passport.user.balance = balanceData.balance;


                res.status(200).json({ message: rsData.message, orderid: idorder });
            }
            else {
                res.status(500).json({ message: rsData.message });
            }
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    getOrder: async function (req, res) {
        //Get necessary data
        user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();

        //Get orders
        const orders = await orderModel.getByUserID(user.id);
        console.log(orders);
        res.render('order', { title: 'Lịch sử thanh toán', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user, orders: orders });
    },

    getOrderDetail: async function (req, res) {
        // Get necessary data
        const user = req.session.passport.user;
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        const order = await orderModel.getByID(req.params.id);

        // Get order detail
        const orderdetails = await orderdetailModel.getByOrderID(req.params.id);

        // Create an array of promises for each order detail
        const orderDetailPromises = orderdetails.map(async function (orderdetail) {
            orderdetail.product = await productModel.getProduct(orderdetail.productid);
        });

        // Wait for all promises to complete
        await Promise.all(orderDetailPromises)

        res.render('orderdetail', { title: 'Chi tiết đơn hàng', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user, orderdetails, order: order });
    }
};      
