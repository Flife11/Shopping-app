
const Order = require('../../models/order.m');
const OrderDetail = require('../../models/orderdetail.m')
const getOrders = async (req, res) => {
    // Get current date
    try {
        const data = await Order.getAllMonthYear();
        res.status(200).json({ orders: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi truy vấn" });
    }
}

const getCategory = async (req, res) => {
    try {
        const data = await OrderDetail.getSumProductInOrder();
        res.status(200).json({ orders: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi truy vấn" });
    }
}


module.exports = { getOrders, getCategory }