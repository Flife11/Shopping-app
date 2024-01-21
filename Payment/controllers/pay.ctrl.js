const jwt = require('jsonwebtoken');
require('dotenv').config();
const USER = require('../models/user.m');
const TRANSACTION = require('../models/transaction.m');
const secret = process.env.JWT_SECRET;
module.exports = {
    createUserBalance: async function (req, res) {
        const token = req.body.token;
        var user = {};
        try {
            var data = jwt.verify(token, secret);
            user['balance'] = 0;
            user['iduser'] = data.iduser;
            try {
                await USER.insert(user);
                res.status(200).json({ message: "tạo user thành công" });
            }
            catch (err) {
                console.log(error);

                res.status(501).json({ message: "Lỗi không thể tạo user balance" })
            }
        }
        catch (error) {
            console.log(error);

            res.status(403).json({ message: "Lỗi không thể decode" })
        }
    },
    payment: async function (req, res) {


        // const user = {
        //     iduser: 123,
        //     date: '2024-01-13',
        //     idorder: 1,
        //     amount: 150000
        // };
        // const accessToken = jwt.sign(user, secret);
        // res.json({ token: accessToken })


        const token = req.body.token;
        try {
            var data = jwt.verify(token, secret);
            console.log(data);
            try {
                if (data.idorder === null) {
                    var user = await USER.getCondition('id', data.iduser);
                    user = user[0];
                    user.balance = parseFloat(user.balance) + parseFloat(data.amount);
                    await USER.update('id', user.id, 'balance', user.balance);
                    data['currentbalance'] = user.balance;
                    await TRANSACTION.insert(data);
                }
                else {
                    var user = await USER.getCondition('id', data.iduser);
                    user = user[0];
                    if (parseFloat(data.amount) > parseFloat(user.balance)) {
                        res.status(405).json({ message: "Amount của đơn hàng lớn hơn balance của user" });
                        return;
                    }
                    else {
                        user.balance = parseFloat(user.balance) - parseFloat(data.amount);
                        await USER.update('id', user.id, 'balance', user.balance);
                        data.amount = - parseFloat(data.amount);
                        data['currentbalance'] = user.balance;
                        await TRANSACTION.insert(data);

                        var user_receive = await USER.getCondition('id', 0);
                        user_receive = user_receive[0];
                        user_receive.balance = parseFloat(user_receive.balance) - data.amount;
                        await USER.update('id', 0, 'balance', user_receive.balance);
                    }
                }
                const message = {}
                res.status(200).json({ message: "Thanh toán thành công!" });
            }
            catch (err) {
                console.log(err);

                res.status(501).json({ message: "Lỗi không thể thanh toán!" })
            }
        }
        catch (error) {
            console.log(error);
            res.status(403).json({ message: "Lỗi không thể decode!" })
        }

    },
    historypayment: async function (req, res) {
        const token = req.body.token;
        var user = {};
        try {
            var data = jwt.verify(token, secret);
            const id = data.iduser;
            try {
                const history= await TRANSACTION.getCondition('userid',id);
                const dataSend = {
                    history: history
                }
                const accessToken = jwt.sign(dataSend, secret);
                res.status(200).json({ message: "Lấy thành công Balance", token: accessToken });
            }
            catch (err) {
                console.log(err);

                res.status(501).json({ message: "Lỗi không thể tạo user balance" })
            }
        }
        catch (error) {
            console.log(error);

            res.status(403).json({ message: "Lỗi không thể decode" })
        }
    },
    getbalance: async function (req, res) {

        const token = req.body.token;
        try {
            var data = jwt.verify(token, secret);
            const id = data.iduser;
            try {
                const user = await USER.getCondition('id', id);
                if (user.length == 0) {
                    res.status(401).json({ message: "Lỗi Không tồn tại user id" })
                }
                else {
                    const dataSend = {
                        balance: user[0].balance
                    }
                    const accessToken = jwt.sign(dataSend, secret);
                    res.status(200).json({ message: "Lấy thành công Balance", token: accessToken });
                }
            }
            catch (err) {
                console.log(error);

                res.status(501).json({ message: "Lỗi không thể tạo user balance" })
            }
        }
        catch (error) {
            console.log(error);

            res.status(403).json({ message: "Lỗi không thể decode" })
        }
    },
}
// const user={
//     iduser: 123,
//     date: '2024-01-13',
//     idorder: 1,
//     amount: 150000
//   };
// const accessToken = jwt.sign(user, secret);
// res.json({token:accessToken})


