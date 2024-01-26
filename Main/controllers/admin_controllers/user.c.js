const User = require('../../models/user.m');
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const corsHelper = require('../../utilities/corsHelper');

const RenderUser = async (req, res, next) => {
    try {
        let name = req.query.name || '';
        let address = req.query.address || '';
        let username = req.query.username || '';
        let email = req.query.email || '';
        let role = req.query.role || '';
        let page = 1;
        let perpage = 10;        
        
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);

        let data = await User.getUserByName(name, username, address, email, role);        
        
        const totalItems = data.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        // console.log(page, perpage);
        data = data.slice((page - 1) * perpage, page * perpage);
        //console.log(data);
        // Thêm url detail
        data = data.filter(d => {            
            d.detailurl = '/admin/user/detail/';
            return d;
        })
        // console.log(data);

        res.render('product', {
            title: 'Admin',
            header: 'TÀI KHOẢN',
            newurl: '/admin/user/new',
            emailCol: 'EMAIL',
            addressCol: 'ĐỊA CHỈ',
            usernameCol: 'TÊN TÀI KHOẢN',
            roleCol: 'PHÂN QUYỀN',
            name,
            address,
            email,
            username,
            role,
            data: data, 
            page: page, 
            perpage: perpage,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            deleteurl: 'http://localhost:3000/admin/user/delete'
        })
    } catch (error) {
        next(error);
    }
}

const {checkConnection} = require('../../middleware/checkConnect2Server');

const DeleteUser = async(req, res, next) => {
    try {
        const { listID } = req.body;
        // Code to check `Connection from Server Main to Server Payment
        try {
            const result = await checkConnection(req);
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
        // console.log(listID);        
        const corsToken = await corsHelper.generateCorsToken(req); // token to verify cors

        try {
            let token = jwt.sign({ listID }, secret, { expiresIn: 24 * 60 * 60 });
            let data = { token: token };
            let PaymentURL = process.env.PAYMENT_URL;
            let rs = await fetch(PaymentURL + '/deleteuser', {
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
            } else {
                User.delete(listID);
                return res.status(201).json({url: 'http://localhost:3000/admin/user'});
            }
            return res.status(401).json({ message: "Không thể xóa tài khoản" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error });
        }        
    } catch (error) {
        next(error);
    }
}

const NewUser = async(req, res, next) => {
    try {
        res.render('newproduct', {
            title: 'Admin',
            header: 'Thêm tài khoản',
            posturl: 'http://localhost:3000/admin/user/new',
            cancelurl: 'http://localhost:3000/admin/user',
            // Tên các fields cần điền
            nameCol: 'Tên khách hàng',
            addressCol: 'Địa chỉ',
            usernameCol: 'Tên tài khoản',
            emailCol: 'Email',
            passwordCol: 'Mật khẩu',
            catnameCol: 'Phân quyền',
            notiAppearance: 1,
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create            
            catidVal: 0,
            subcatidVal: 0,
            // Dữ liệu
            categories: [{id: 1, name: "admin"}, {id: 2, name: "client"}],
        })
    } catch (error) {
        next(error);
    }
}

const { postRegister } = require('../account.c');
const CreateUser = async(req, res, next) => {
    try {
        let {name, address, username, password, email, category} = req.body;
        if (category==0) {
            category = 'admin';
            User.insert({name, address, username, password, email, role: category});
            return res.status(201).json({
                message: "Tạo tài khoản thành công",
                redirecturl: "http://localhost:3000/admin/user"
            })
        }
        else {
            category = 'client';
            req.body.retypepassword = password;            
            postRegister(req, res);
        }

    } catch (error) {
        next(error);
    }
}

const DetaiilUser = async(req, res, next) => {
    try {
        let id = req.params.id;
        let user = await User.getUserByID(id);        
        // console.log(user);
        let catidVal = 0;
        let subcatidVal = 0;
        if (user.role=='client') catidVal = 1;

        res.render('newproduct', {
            title: 'Admin',
            header: 'Chi tiết tài khoản',
            posturl: 'http://localhost:3000/admin/user/update',
            cancelurl: 'http://localhost:3000/admin/user',
            // Tên các fields cần điền
            nameCol: 'Tên khách hàng',
            addressCol: 'Địa chỉ',
            usernameCol: 'Tên tài khoản',
            emailCol: 'Email',
            passwordCol: 'Mật khẩu mới',
            catnameCol: 'Phân quyền',
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            nameVal: user.name,
            addressVal: user.address,
            usernameVal: user.username,
            emailVal: user.email,
            catidVal,
            subcatidVal,
            // Dữ liệu
            categories: [{id: 1, name: "admin"}, {id: 2, name: "client"}],
        })
    } catch (error) {
        next(error);
    }
}

const UpdateUser = async(req, res, next) => {
    try {
        let {name, address, username, password, email, category} = req.body;
        User.editUser({name, address, username, password, email, category});            
        return res.status(201).json({
            message: "CHỉnh sửa tài khoản thành công",
            redirecturl: "http://localhost:3000/admin/user"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderUser, DeleteUser, CreateUser , NewUser, DetaiilUser, UpdateUser}