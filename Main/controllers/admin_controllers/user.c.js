const User = require('../../models/user.m');
const bcrypt = require('bcrypt');
const corsHelper = require('../../utilities/corsHelper');
const secret = process.env.JWT_SECRET;

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
        console.log(data);

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

const DeleteUser = async(req, res, next) => {
    try {
        const { listID } = req.body;
        // console.log(listID);
        User.delete(listID);
        res.status(201).json({url: 'http://localhost:3000/admin/user'});
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
            res.redirect('http://localhost:3000/admin/user/new');
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

        res.redirect('http://localhost:3000/admin/user');
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderUser, DeleteUser, CreateUser , NewUser, DetaiilUser, UpdateUser}