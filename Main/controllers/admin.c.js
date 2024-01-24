

const Order = require('../models/order.m');
const OrderDetail = require('../models/orderdetail.m')
const getOrders = async (req, res) => {
    // console.log(req.body);
    const dateFrom = req.body.from;
    const dateTo = req.body.to;
    var titleX = '';
    // Get current date
    try {
        const data = await Order.getAllDate(dateFrom, dateTo);
        // console.log(data);
        // Trường hợp Biểu đồ theo từng năm
        if (parseInt(dateFrom.split('-')[0], 10) != parseInt(dateTo.split('-')[0], 10)) {
            // console.log("Nam");
            titleX = "Năm";
            const resultArray = [];

            //Lượt bỏ các dòng có ngày trùng nhau
            data.forEach(order => {
                const orderYear = new Date(order.date).getFullYear();

                const existingDay = resultArray.find(item => item.year === orderYear);

                if (existingDay) {
                    // Nếu ngày đã tồn tại, cộng thêm tổng tiền
                    existingDay.total += parseFloat(order.total);
                } else {
                    // Nếu ngày chưa tồn tại, thêm một đối tượng mới vào mảng
                    resultArray.push({ year: orderYear, total: parseFloat(order.total) });
                }
            });
            // Sắp xếp mảng theo ngày
            resultArray.sort((a, b) => a.year - b.year);


            // Create label and data for pieChart
            var lineLabels = [];
            var lineData = [];
            for (const order of resultArray) {
                lineLabels.push(order.year.toString());
                lineData.push((order.total));
            }
            res.status(200).json({ lineLabels: lineLabels, lineData: lineData, titleX: titleX });
            return;
        }
        // Trường hợp Biểu đồ theo từng tháng trong năm
        if (parseInt(dateFrom.split('-')[1], 10) != parseInt(dateTo.split('-')[1], 10)) {


            // console.log("Thang");
            titleX = "Tháng";

            const resultArray = [];
            //Lượt bỏ các dòng có ngày trùng nhau
            data.forEach(order => {
                const orderMonth = new Date(order.date).getMonth() + 1;

                const existingDay = resultArray.find(item => item.month === orderMonth);
                if (existingDay) {
                    // Nếu ngày đã tồn tại, cộng thêm tổng tiền
                    existingDay.total += parseFloat(order.total);
                } else {
                    // Nếu ngày chưa tồn tại, thêm một đối tượng mới vào mảng
                    resultArray.push({ month: orderMonth, total: parseFloat(order.total) });
                }
            });
            // Sắp xếp mảng theo ngày
            resultArray.sort((a, b) => a.month - b.month);

            // Create label and data for pieChart
            var lineLabels = [];
            var lineData = [];
            for (const order of resultArray) {
                lineLabels.push(order.month.toString());
                lineData.push((order.total));
            }
            res.status(200).json({ lineLabels: lineLabels, lineData: lineData, titleX: titleX });
            return;
        }
        // Trường hợp Biểu đồ theo từng ngày trong tháng
        // console.log("Ngay");
        titleX = "Ngày";

        const resultArray = [];
        //Lượt bỏ các dòng có ngày trùng nhau
        data.forEach(order => {
            const orderDate = new Date(order.date).getDate();

            const existingDay = resultArray.find(item => item.date === orderDate);

            if (existingDay) {
                // Nếu ngày đã tồn tại, cộng thêm tổng tiền
                existingDay.total += parseFloat(order.total);
            } else {
                // Nếu ngày chưa tồn tại, thêm một đối tượng mới vào mảng
                resultArray.push({ date: orderDate, total: parseFloat(order.total) });
            }
        });
        // Sắp xếp mảng theo ngày
        resultArray.sort((a, b) => a.date - b.date);


        // Create label and data for pieChart
        var lineLabels = [];
        var lineData = [];
        for (const order of resultArray) {
            lineLabels.push(order.date.toString());
            lineData.push((order.total));
        }
        res.status(200).json({ lineLabels: lineLabels, lineData: lineData, titleX: titleX });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi truy vấn" });
    }
}

const getCategory = async (req, res) => {
    // console.log(req.body);
    const dateFrom = req.body.from;
    const dateTo = req.body.to;
    try {
        const data = await OrderDetail.getSumProductInOrder(dateFrom, dateTo);
        var pieLabels = [];
        var pieData = [];
        for (const category of data) {
            pieLabels.push(category.name);
            pieData.push(parseInt(category.sum));
        }
        res.status(200).json({ pieLabels: pieLabels, pieData: pieData });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi truy vấn" });
    }
}


const RenderAdmin = async (req, res, next) => {
    // Get current date

    var total_order = 0;
    var total_product = 0;
    var total_customer = 0;
    var total_price = 0;
    var ngayHienTai = new Date();
    var ngayChiTiet = FormatDate(ngayHienTai)
    ngayHienTai.setDate(1); // Đặt ngày là 1 để lấy ngày đầu tiên của tháng
    var ngayDauTienCuaThang = FormatDate(ngayHienTai);
    try {
        const data = await Order.getAllDate(ngayDauTienCuaThang, ngayChiTiet);
        // console.log(data);
        total_order = data.length;

        //calculate total customer
        var count_customer = [];
        for (const order of data) {
            var current_id = order.userid;
            if (!count_customer.includes(current_id)) {
                count_customer.push(current_id);
            }
        }
        total_customer = count_customer.length;

        //calculate total price
        var price = 0;
        for (const order of data) {
            price = price + parseFloat(order.total);
        }
        total_price = price + ' VNĐ';
    }
    catch (err) {
        console.log(err);

    }
    var total_product = 0;
    try {
        const data = await OrderDetail.getSumProductInOrder(ngayDauTienCuaThang, ngayChiTiet);
        for (const category of data) {
            total_product = total_product + parseInt(category.sum);
        }
    }
    catch (err) {
        console.log(err);
    }
    res.render('admin', {
        title: 'Admin',
        total_order: total_order,
        total_customer: total_customer,
        total_price: total_price,
        total_product: total_product
    })
}
const getTotalHome = async (req, res, next) => {
    // console.log(req.body);
    const dateFrom = req.body.from;
    const dateTo = req.body.to;
    try {
        const data = await OrderDetail.getSumProductInOrder(dateFrom, dateTo);
        // Get current date

        var total_order = 0;
        var total_product = 0;
        var total_customer = 0;
        var total_price = 0;
        try {
            const data = await Order.getAllDate(dateFrom, dateTo);
            // console.log(data);
            total_order = data.length;

            //calculate total customer
            var count_customer = [];
            for (const order of data) {
                var current_id = order.userid;
                if (!count_customer.includes(current_id)) {
                    count_customer.push(current_id);
                }
            }
            total_customer = count_customer.length;

            //calculate total price
            var price = 0;
            for (const order of data) {
                price = price + parseFloat(order.total);
            }
            total_price = price + ' VNĐ';
        }
        catch (err) {
            console.log(err);

        }
        try {
            const data = await OrderDetail.getSumProductInOrder(dateFrom, dateTo);
            for (const category of data) {
                total_product = total_product + parseInt(category.sum);
            }
        }
        catch (err) {
            console.log(err);
        }
        res.status(200).json({
            total_order: total_order,
            total_customer: total_customer,
            total_price: total_price,
            total_product: total_product
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi truy vấn" });
    }
}
function FormatDate(date) {
    const dateWithoutTimeZone = new Date(date);

    const year = dateWithoutTimeZone.getFullYear();
    const month = dateWithoutTimeZone.getMonth() + 1;
    const day = dateWithoutTimeZone.getDate();
    const hours = dateWithoutTimeZone.getHours();
    const minutes = dateWithoutTimeZone.getMinutes();
    const seconds = dateWithoutTimeZone.getSeconds();

    const formattedDateWithoutTimeZone = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateWithoutTimeZone;
}
module.exports = { RenderAdmin, getOrders, getCategory, getTotalHome }