require('dotenv').config();
const bcrypt = require('bcrypt');

const pgp = require('pg-promise')({
    capSQL: true
});

const connectionString = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DB,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
}

const db = pgp(connectionString);
module.exports = {
    getByOffset: async (tbName, offset, condition, limit) => {
        let dbcn = null;
        try {            
            dbcn = await db.connect();
            const query = `
            SELECT * FROM
            (SELECT * FROM "${tbName}" ${condition}')
            LIMIT ${limit}
            OFFSET ${offset};`
            const data = await db.any(query);
            return data;
        } catch (error) {
            throw error
        } finally {
            dbcn.done();
        }
    },

    // tbName: tên của bảng
    // getCol: mảng các cột cần lấy giá trị ví dụ: ['id', 'name']
    // condition: điều kiện where nếu có ví dụ 'where id=1'
    get: async (tbName, getCol, condition='') => {
        let dbcn = null;
        try {            
            dbcn = await db.connect();
            const query = `SELECT ${getCol.join()} FROM "${tbName}" ${condition}'`;
            const data = await db.any(query);
            return data;
        } catch (error) {
            throw error
        } finally {
            dbcn.done();
        }
    },
    // tbName: tên của bảng
    // colName: mảng các cột sẽ thêm giá trị ví dụ: ['id', 'name']
    // data: mảng các giá trị sẽ được thêm mỗi giá trị là một object với key giống với tên cột
    insert: async (tbName, colName, data) => {
        try {
            const query = pgp.helpers.insert(data, colName, tbName);
            const d = await db.query(query + 'RETURNING id');
            return d;
        } catch (error) {
            throw error
        }
    },

    // tbName: tên của bảng
    // colName: mảng các cột sẽ cập nhật giá trị ví dụ: ['id', 'name']
    // data: mảng các giá trị sẽ được thêm mỗi giá trị là một object với key giống với tên cột
    // condition: điều kiện where nếu có ví dụ 'where id=1'
    update: async function(tbName, colName, data, condition) {
        let dbcn = null;
        try {
            dbcn = await db.connect();
            const query = pgp.helpers.update(data, colName, tbName);
            const d = await db.query(query + ` ${condition}`);
            return d;
        } catch (error) {
            throw error
        } finally {
            dbcn.done();
        }
    },
    
    initDatabase: async function(){
        try {
            // Kiểm tra xem database đã tồn tại chưa    
            const databaseExists = await db.oneOrNone(
                'SELECT 1 FROM pg_database WHERE datname = $1',
                process.env.DB_MAINNAME
            );
    
            // Nếu database chưa tồn tại
            if (!databaseExists) {
                // Tạo mới database
                await db.none(`CREATE DATABASE ${process.env.DB_MAINNAME}`);
                console.log(`Database ${process.env.DB_MAINNAME} created.`);
    
                // Kết nối đến database mới tạo
                db.$pool.options.database = process.env.DB_MAINNAME;
                await db.connect();

                // Tạo các bảng trong database
                await db.none(`
                    DROP TABLE IF EXISTS "CATEGORY" CASCADE;
                    CREATE TABLE "CATEGORY"(
                        id serial,
                        name varchar(100),
                        
                        PRIMARY KEY(id)
                    );
                    
                    DROP TABLE IF EXISTS "SUBCATEGORY" CASCADE;
                    CREATE TABLE "SUBCATEGORY"(
                        id serial,
                        catid int NOT NULL,
                        name varchar(100),
                        
                        PRIMARY KEY(id),
                        FOREIGN KEY (catid) REFERENCES "CATEGORY"(id) ON DELETE CASCADE
                    );
                    
                    DROP TABLE IF EXISTS "PRODUCT" CASCADE;
                    CREATE TABLE "PRODUCT"(
                        id serial,
                        catid int NOT NULL,
                        subcatid int,
                        name varchar(100),
                        price numeric(10,2),
                        quantity int,
                        image varchar(100),
                        shortdescription varchar(500),
                        fulldescription varchar(3000),
                        
                        PRIMARY KEY (id),
                        FOREIGN KEY (catid) REFERENCES "CATEGORY"(id) ON DELETE CASCADE,
                        FOREIGN KEY (subcatid) REFERENCES "SUBCATEGORY"(id) ON DELETE CASCADE
                    );
                    
                    DROP TABLE IF EXISTS "USER" CASCADE;
                    CREATE TABLE "USER"(
                        id serial,
                        username varchar(100) UNIQUE,
                        password varchar(500),
                        name varchar(100),
                        email varchar(100),
                        role varchar(100) CHECK (role IN ('client', 'admin')),
                        
                        PRIMARY KEY (id)
                    );
                    
                    DROP TABLE IF EXISTS "ORDER" CASCADE;
                    CREATE TABLE "ORDER"(
                        id serial,
                        userid int NOT NULL,
                        date timestamp,
                        total numeric(15,2),
                        
                        PRIMARY KEY (id),
                        FOREIGN KEY (userid) REFERENCES "USER"(id) ON DELETE CASCADE
                    );
                    
                    DROP TABLE IF EXISTS "ORDERDETAIL" CASCADE;
                    CREATE TABLE "ORDERDETAIL"(
                        id serial,
                        orderid int NOT NULL,
                        productid int NOT NULL,
                        quantity int,
                        price numeric(10,2),
                        total numeric(15,2),
                        
                        PRIMARY KEY (id),
                        FOREIGN KEY (orderid) REFERENCES "ORDER"(id) ON DELETE CASCADE,
                        FOREIGN KEY (productid) REFERENCES "PRODUCT"(id) ON DELETE CASCADE
                    );
                `)

                // Tạo tài khoản admin và thêm vào database
                const user1 = {
                    username: 'admin1',
                    password: await bcrypt.hash('123', parseInt(process.env.SALT_ROUNDS)),
                    name: 'Admin 1',
                    email: 'abc@gmail.com',
                    role: 'admin'
                }
                const user2 = {
                    username: 'admin2',
                    password: await bcrypt.hash('123', parseInt(process.env.SALT_ROUNDS)),
                    name: 'Admin 2',
                    email: 'def@gmail.com',
                    role: 'admin'
                }

                await db.none('INSERT INTO "USER"(username, password, name, email, role) VALUES(${username}, ${password}, ${name}, ${email}, ${role})', user1);
                await db.none('INSERT INTO "USER"(username, password, name, email, role) VALUES(${username}, ${password}, ${name}, ${email}, ${role})', user2);

                //Thêm dữ liệu mẫu bán hàng vào database
                await db.none(`
                    INSERT INTO "CATEGORY"(id,name) VALUES
                    (1,'Áo'),
                    (2,'Áo khoác'),
                    (3,'Quần'),
                    (4,'Đồ ngủ'),
                    (5,'Giày');
                    
                    INSERT INTO "SUBCATEGORY"(id, catid, name) VALUES 
                    (1,1,'Áo thun'),
                    (2,1,'Áo sơ mi'),
                    (3,3,'Quần dài'),
                    (4,3,'Quần ngắn');
                    
                    -- Áo thun (1,1)
                    INSERT INTO "PRODUCT" VALUES 
                    (1,1,1,'Áo Thun Phông Unisex Street Fox',157500,50,'1.jpg','Áo Thun Phông Nam Nữ Local Brand Form Rộng Unisex Street Fox',
                    '- Chất liệu: Vải Cotton 100% 2 chiều
                    - Màu sắc: Đen
                    - Form: Local Brand - Unisex
                    - Chất lượng in: In lụa dùng mực Nhật Bản chất lượng cao
                    - Bảo quản: Có thể giặt máy & giặt ngâm
                    
                    Size: Freesize từ 45kg đến 65kg - 1m50 đến 1m70
                    
                    VỆ SINH VÀ BẢO QUẢN ĐÚNG CÁCH:
                    Để vệ sinh và bảo quản sản phẩm một cách tốt nhất trước tiên sản phẩm cần được phân loại theo chất liệu, cân nặng và màu sắc với nhau.
                    Theo chất liệu: Các sản phẩm từ Cotton không nên giặt chung với jean và các chất liệu có tính co giãn như Polyester, Spandex…
                    Theo cân nặng: Các sản phẩm có độ dày và nặng không nên giặt chung với các sản phẩm nhẹ như tee, shirt…
                    Theo màu sắc:	Các sản phẩm có màu sáng như (trắng, xám nhạt, beige, cream, nude) không nên giặt chung với các sản phẩm tối màu (đen, xám đậm, xám than) và các sản phẩm có màu nổi (đỏ,cam, vàng, neon…)	
                    Khuyến khích giặt bằng tay với nước và chất tẩy rửa không quá mạnh.
                    Phơi khô hoàn toàn ở nơi thoáng gió.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (2,1,1,'Áo Thun CLOUDZY BASIC TEE',115000,3,'2.jpg','Áo thun nữ nam unisex tay lỡ phông local brand form rộng teen cổ tròn oversize cotton CLOUDZY BASIC TEE',
                    '- Chất liệu: Vải Cotton 100% 2 chiều
                    - Màu sắc: Hồng nhạt
                    - Form: Local Brand - Unisex
                    - Chất lượng in: In lụa dùng mực Nhật Bản chất lượng cao
                    - Bảo quản: Có thể giặt máy & giặt ngâm
                    
                    Size: Freesize từ 45kg đến 65kg - 1m50 đến 1m70
                    
                    VỆ SINH VÀ BẢO QUẢN ĐÚNG CÁCH:
                    Để vệ sinh và bảo quản sản phẩm một cách tốt nhất trước tiên sản phẩm cần được phân loại theo chất liệu, cân nặng và màu sắc với nhau.
                    Theo chất liệu: Các sản phẩm từ Cotton không nên giặt chung với jean và các chất liệu có tính co giãn như Polyester, Spandex…
                    heo cân nặng: Các sản phẩm có độ dày và nặng không nên giặt chung với các sản phẩm nhẹ như tee, shirt…
                    Theo màu sắc:	Các sản phẩm có màu sáng như (trắng, xám nhạt, beige, cream, nude) không nên giặt chung với các sản phẩm tối màu (đen, xám đậm, xám than) và các sản phẩm có màu nổi (đỏ,cam, vàng, neon…)	
                    Khuyến khích giặt bằng tay với nước và chất tẩy rửa không quá mạnh.
                    Phơi khô hoàn toàn ở nơi thoáng gió.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (3,1,1,'Áo Thun Tay Ngắn Dáng Rộng SELVZE',129000,25,'3.jpg','SELVZE Áo Thun Tay Ngắn Dáng Rộng Vải cotton In Họa Tiết Kiểu retro Đường Phố',
                    '- Chất liệu: 100% Cotton Lỏng lẻo, nhẹ nhàng và mặc rất mát
                    - Màu sắc: trắng, mơ, xanh lá cây (Do cài đặt ánh sáng và màn hình khác nhau, màu sắc của sản phẩm có thể hơi khác so với hình ảnh, vui lòng ưu tiên sản phẩm thực tế.)
                    - Thông số kỹ thuật sản phẩm: Kích thước có thể thay đổi 1-3cm
                    - Gói bao gồm: 1 * áo phông
                    - Kích thước: Freesize: Chiều dài áo: 60, Ngực: 104, Chiều dài tay áo: 20, Chiều rộng vai: 48');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (4,1,1,'Áo Thun in Hình Thời Trang Mùa Hè SELVZE ',130000,25,'4.jpg','SELVZE Áo Thun cotton Tay Ngắn Cổ Tròn Dáng Rộng in Hình Thời Trang Mùa Hè',
                    '- Chất liệu: “100” Cotton Loose, nhẹ và mát khi mặc
                    - Màu sắc: “white.apricot,black.green.pink.brown.blue.rose red.dark red. Do cài đặt ánh sáng và màn hình khác nhau, màu sắc của sản phẩm có thể hơi khác so với hình ảnh, vui lòng ưu tiên sản phẩm thực tế.
                    - Thông số kỹ thuật sản phẩm: Kích thước có thể thay đổi 1-3cm
                    - Gói bao gồm: 1 T-Shirt
                    - Kích thước: Freesize: Chiều dài áo: 60, Ngực: 104, Chiều dài tay áo: 20, Chiều rộng vai: 48');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (5,1,1,'Áo Thun Mèo Phi Hành Gia - TEE5',189000,2,'5.jpg','Áo Thun Local Brand Lourents Collection Premium Mèo Phi Hành Gia - TEE5',
                    '- Chất liệu: “100” Cotton Loose, nhẹ và mát khi mặc
                    - Màu sắc: be
                    - Thông số kỹ thuật sản phẩm: Kích thước có thể thay đổi 1-3cm. Form áo được thiết kế theo tiêu chuẩn tương đối của người Việt Nam.
                    - Gói bao gồm: 1 T-Shirt
                    - Kích thước: Freesize: Dài 69 Rộng 53 | 1m50 - 1m63, 45 - 58Kg');
                    
                    -- Áo sơ mi (1,2)
                    INSERT INTO "PRODUCT" VALUES 
                    (6,1,2,'Áo croptop 3 tầng nút hoa màu',120000,79,'6.jpg','Áo croptop 3 tầng nút hoa màu (ảnh thật)',
                    'MÃ SP: Áo croptop nút nhựa màu sắc 3 tầng.
                    Chất liệu: đũi thô.
                    Số đo áo cụ thể:
                    Dài áo: 43cm
                    Ngang thân: 95cm
                    Tay áo 23cm
                    Vai áo 37cm');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (7,1,2,'Áo sơ mi nam nữ tay ngắn nhung DAVUBA',125000,45,'7.jpg','Áo sơ mi nam nữ tay ngắn nhung tăm kiểu dáng form rộng DAVUBA SM015',
                    'Áo sơ mi nhung tăm được thiết kế theo đúng form chuẩn của Việt Nam
                    - Sản phẩm Áo sơ mi nhung tăm chính là mẫu thiết kế mới nhất cho mùa hè này
                    - Chất liệu mềm mịn, thoải mái: vải nhung tăm
                    - Đem lại sự thoải mái tiện lợi nhất cho người mặc
                    Hướng dẫn sử dụng Áo sơ mi nhung tăm DAVUBA
                    - Đối với sản phẩm quần áo mới mua về, nên giặt tay lần đâu tiên để tránh phai màu sang quần áo khác
                    - Khi giặt nên lộn mặt trái ra để đảm bảo độ bền
                    - Sản phẩm phù hợp cho giặt máy/giặt tay
                    - Size: freesize');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (8,1,2,'Áo sơ mi cộc tay Original ODIN CLUB',115000,29,'8.jpg','Áo sơ mi cộc tay Original ODIN CLUB, Áo sơ mi form rộng unisex nam nữ, Local Brand ODIN CLUB',
                    '- Màu sắc: Trắng
                    - Size: freesize
                    - Kiểu dáng: Oversized.
                    
                    HƯỚNG DẪN SỬ DỤNG:
                    - Lần giặt đầu chỉ nên xả nước lạnh rồi phơi khô.
                    - Khuyến cáo nên giặt tay, hạn chế giặt máy.
                    - Chú ý lộn trái sản phẩm trước khi giặt để không ảnh hướng tới bề mặt vải.
                    - Không sử dụng thuốc tẩy, không giặt chung với các sản phẩm dễ phai màu.
                    - Hạn chế phơi trực tiếp dưới ánh nắng mặt trời, nên phơi khô dưới ảnh sáng tự nhiên.
                    
                    CAM KẾT 
                    - Sản phẩm 100% giống mô tả.
                    - Hình ảnh sản phẩm là ảnh thật do shop tự chụp và giữ bản quyền hình ảnh.
                    - Đảm bảo chất lượng sản phẩm luôn ở mức cao nhất.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (9,1,2,'Áo sơ mi nam ngắn tay mango Hàn Quốc LADOS',259000,29,'9.jpg','Áo sơ mi nam ngắn tay mango Hàn Quốc LADOS-8110 chống nhăn, lịch lãm',
                    '- Màu sắc: đen
                    - Size: freesize
                    - Kiểu dáng: Oversized
                    - Chất liệu: chất mago mềm mịn , thoáng mát
                    
                    HƯỚNG DẪN SỬ DỤNG:
                    - Lần giặt đầu chỉ nên xả nước lạnh rồi phơi khô.
                    - Khuyến cáo nên giặt tay, hạn chế giặt máy.
                    - Chú ý lộn trái sản phẩm trước khi giặt để không ảnh hướng tới bề mặt vải.
                    - Không sử dụng thuốc tẩy, không giặt chung với các sản phẩm dễ phai màu.
                    - Hạn chế phơi trực tiếp dưới ánh nắng mặt trời, nên phơi khô dưới ảnh sáng tự nhiên.
                    
                    CAM KẾT 
                    - Sản phẩm 100% giống mô tả.
                    - Hình ảnh sản phẩm là ảnh thật do shop tự chụp và giữ bản quyền hình ảnh.
                    - Đảm bảo chất lượng sản phẩm luôn ở mức cao nhất.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (10,1,2,'Áo sơ mi nữ tay ngắn form rộng unisex in họa tiết ',109000,19,'10.jpg','Áo sơ mi nữ tay ngắn form rộng unisex in họa tiết cá tính phong cách hàn quốc',
                    '- Màu sắc: in họa tiết màu
                    - Size: freesize dưới 65kg
                    - Kiểu dáng: Oversized
                    - Chất liệu : polyester 
                    ----------------------------------
                    LƯU Ý
                    + Áo sơ mi họa tiết từ 1 cây vải cắt ra nên phần họa tiết sẽ bị lệch vị trí so với hình mẫu! 
                    + Màu sắc vải/ sản phẩm có thể sẽ chênh lệch thực tế một phần nhỏ, do ảnh hưởng về độ lệch màu của ánh sáng nhưng vẫn đảm bảo chất lượng.
                    + Mọi thắc mắc về sản phẩm bạn cứ chat với shop thoải mái nha!!!!!
                    
                    KHUYẾN NGHỊ GIẶT
                    Lộn trái sản phẩm trước khi giặt
                    Giặt với nước lạnh và nước giặt không có chất tẩy cao
                    Nên giặt tay, không giặt với nước nóng, không ngâm quá lâu
                    -----------------------------------------------------------------
                    SHOP CAM KẾT
                    Hàng có sẵn, giao hàng ngay khi nhận được đơn
                    Sản phẩm được kiểm tra kĩ càng trước khi gói hàng giao cho khách
                    ');
                    
                    --Áo khoác (2,null)
                    INSERT INTO "PRODUCT" VALUES 
                    (11,2,null,'Áo Khoác Nam Nữ Unisex By PEABOO tím',300000,90,'11.jpg','Áo Hoodie Zip, Áo Khoác Nam Nữ Unisex By PEABOO Mã Thỏ A Good Dat Chất Nỉ Bông Form Rộng Mũ 2 Lớp màu tím',
                    '✨ MÔ TẢ SẢN PHẨM: 
                    - Màu sắc đa dạng, đảm bảo vải chất lượng, giá cả cạnh tranh. 
                    - Áo được kiểm tra kĩ càng, cẩn thận và tư vấn nhiệt tình trước khi gói hàng giao cho Quý Khách
                    - Hàng có sẵn, giao hàng ngay khi nhận được đơn 
                    
                    ✨ THÔNG TIN CHI TIẾT SẢN PHẨM
                    ⚡️ Màu sắc:  Tím
                    ⚡️ Chất liệu: Nỉ Bông Cotton vải may kỹ, mặc đứng dáng, không xù, không phai màu
                    ⚡️ Thiết kế: Form Rộng, thoải mái, năng động
                    ⚡️ Phù hợp: Áo dành cho cả nam và nữ, ở nhà, đi học, di du lịch, dạo phố, hẹn hò,...
                    
                    ⚜️ THÔNG SỐ SIZE: Freesize dưới 70kg');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (12,2,null,'Áo khoác dù nam nữ phối màu 2 lớp oversize',109500,19,'12.jpg','Áo khoác dù nam nữ phối màu 2 lớp oversize',
                    '-  Kiểu dáng: Áo khoác dù nhẹ - chống nắng - Form rộng
                    - Chất liệu: áo khoác dù được thiết kế với chất liệu dù 2 lớp nhẹ có mũ trùm đầu giúp chống nắng, giữ ấm tốt, tránh gió hiệu quả, giúp bảo vệ làn da, giúp bạn tự tin khi ra đường dù thời tiết nắng nóng hay giá rét. Ống tay áo hiện đại, trẻ trung với thiết kế bo chắc chắn, mang đến cảm giác khỏe khắm, thời trang. áo khoác gió được thiết kế với tone màu trẻ trung, tinh tế, thời trang, dễ dàng phối đồ theo sở thích của bạn.
                    -  Xuất Xứ: Việt Nam.
                    -  Bảo Quản: Vệ sinh áo khoác bằng tay hoặc máy giặt.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (13,2,null,'Áo Khoác Nỉ Zip Kéo Unisex Tag Nhựa WZS',169000,2,'13.jpg','Áo Khoác Nỉ Zip Kéo Unisex Tag Nhựa WZS',
                    'Chất liệu nỉ bông mềm mại ấm áp, tay dài bo chun.Thiết kế dạng hoodie nên rất dễ mang,dễ phối,hình thêu rất tỉ mỉ.Mặc làm áo khoác mùa hè hay mùa lạnh đều xinh nha !
                    Hiện nay trên thị trường có rất nhiều Shop khác sử dụng hình ảnh sản phẩm của BingBing để bán các sản phẩm không đảm bảo chất lượng. Cùng 1 sản phẩm, cùng 1 màu, ảnh giống nhau nhưng chất lượng sản phẩm, chất lượng dịch vụ sẽ khác nhau.
                    
                    Size: Freesize dưới 65kg
                    
                    Do vậy các bạn hãy CỰC KÌ cân nhắc khi mua để tránh trường hợp sản phẩm không chất lượng nhé.
                    ➊ 100% hình ảnh là chụp thật do shop tự chụp.
                    ➋ Giá luôn tốt nhất. Tư vấn tận tâm chi tiết nhất.
                    ➌ Đổi trả miễn phí nếu khách hàng không hài lòng với sản phẩm & dịch vụ.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (14,2,null,'Áo Khoác Nỉ Hoodie Zip BEST',269000,86,'14.jpg','Áo Khoác Nỉ Hoodie Zip BEST Form Rộng Nam Nữ Unisex',
                    '+ Màu sắc : Be
                    + Họa tiết : In
                    + Form : Cơ bản
                    + Size: Freesize
                    + Đường may chuẩn chỉnh, tỉ mỉ, chắc chắn.
                    + Thiết kế hiện đại, trẻ trung, năng động. Dễ phối đồ.
                    Lưu ý : Khi nhận hàng sản phẩm sẽ còn dính một ít lông bên trong áo khi sản xuất ( giặt đi là sẽ hết )');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (15,2,null,'Áo Khoác Dù Different Form Rộng Unisex',189000,106,'15.jpg','Áo Khoác Dù Different Form Rộng Unisex',
                    'HÀNG CÓ SẴN
                    Chất liệu 2 LỚP DÙ  ấm áp, tay dài bo chun.Thiết kế dạng bomber nên rất dễ mang,dễ phối,hình in rất tỉ mỉ.Mặc làm áo khoác mùa hè hay mùa lạnh đều xinh nhé !
                    + Màu sắc : Đen
                    + Form : Cơ bản
                    + Size: Freesize
                    + Đường may chuẩn chỉnh, tỉ mỉ, chắc chắn.
                    + Thiết kế hiện đại, trẻ trung, năng động. Dễ phối đồ.');
                    
                    --Quần dài (3,3)
                    INSERT INTO "PRODUCT" VALUES 
                    (16,3,3,'Quần túi hộp nữ The Heaven',165000,97,'16.jpg','Quần túi hộp nữ The Heaven ống rộng chất kaki chính hãng nhiều màu siêu giữ dáng thu đông 2023',
                    ' ❖ Chất liệu: quần túi hộp nữ được sản xuất bằng chất Kaki Cottton có pha chút Polly. Chất vải được sản xuất bởi Heaven được kiểm duyệt đảm bảo chất vải Dày Dặn, kiểm soát thuốc nhuộm AN TOÀN CHO DA. Đảm bảo thoáng mát, đứng form cho người mặc  
                    ❖ Đường may: Quần túi hộp nữ được sản xuất chính bởi Heaven nên cam kết về sự chắc chắn và tỉ mỉ trong từng đường chỉ
                    ❖ Kiểu dáng: Quần túi hộp nữ được sản xuất với sự đa dạng về cách mặc
                        - Bạn kéo quần xuống dưới rốn thì quần sẽ có form kiểu dáng thụng, kiểu quần hiphop ống rộng
                        - Bạn kéo quần trên rốn thì quần chúng tớ có form dạng quần ống suông, giúp người mặc chông thẳng chân hơn
                        - Nếu bạn muốn mặc thể thao, hoạt động mạnh thì mình có thể kéo dây quần dưới ống chân để quần thành dạng quần jogger nha mọi người ơi
                    ❖ Màu sắc: đen
                    ❖ Size: freesize');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (17,3,3,'Quần Jean nữ ống rộng Ulzzang',179000,128,'17.jpg','Quần Jean nữ ống rộng Ulzzang lưng cao phong cách Retro Jean xanh nhạt - Jean Baggy Kyubi BJR21R',
                    '🔸️ Chất liệu Jeans cotton mềm mịn nhẹ thoáng mát đem lại cảm giác thoải mái nhất khi mặc thường xuyên.
                    🔸️ Size: freesize dưới 70kg
                    🔸️ Màu: Wash Xanh Nhạt và Đen Xám
                    
                    🌸 Hướng dẫn bảo quản:
                    - Giặt sản phẩm với nước ở nhiệt độ thường
                    - Giặt bằng tay cho lần đầu sử dụng.
                    - Không được sấy khô
                    - Ủi mặt trái với nhiệt độ nóng vừa
                    - Không xoắn vắt mạnh
                    - Ủi ở nhiệt độ tối đa 110 độ C
                    - Nên phơi sản phẩm ở nơi khô ráo, thoáng mát, hạn chế ánh nắng trực tiếp');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (18,3,3,'Quần Đũi Nữ Ống Rộng Suông GUDLOOK',85000,5,'18.jpg','Quần Đũi Nữ Ống Rộng Suông GUDLOOK Trẻ Trung Chất Linen Mát - Quần 9 Tấc suông',
                    'Quần Đũi Nữ Ống Rộng Suông GUDLOOK Trẻ Trung Chất Mát
                    - Xuất xứ: Việt Nam
                    - Đối tượng phù hợp: Nữ
                    - Độ tuổi phù hợp: 18 - 40
                    - Hoàn cảnh phù hợp: Đi làm, Đi chơi, Đi biển
                    - Mùa phù hợp: Bốn mùa
                    - Size: freesize dưới 80kg');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (19,3,3,'Quần Jean Nam Ống Suông Rộng',155000,68,'19.jpg','Quần Jean Nam Ống Suông Rộng Chất Vải Dày Dặn Màu Đen Trầm SMOKE',
                    'Quần Jean Nam Ống Suông Rộng Chất Vải Dày Dặn Màu Đen Trầm SMOKE V.1
                    
                    - Gói bao gồm: 1 * quần túi zip
                    - Chất liệu: Denim Cotton QC918
                    - Màu Sắc: Đen Trầm SMOKE V.1
                    - Form: Suông - Rộng
                    - Size: freesize dưới 80kg');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (20,3,3,'Quần ống rộng nam DOLARO nhung tăm kẻ line',120000,68,'20.jpg','Quần ống rộng nam DOLARO nhung tăm kẻ line, quần dài dáng suông nam nữ lưng cao',
                    '- Shop brand: DOLARO
                    - Xuất xứ: Việt Nam
                    - Chất liệu: Quần ống rộng nam là nhung tăm giày dặn, lên form chuẩn
                    - Màu sắc quần ống rộng nam DOLARO nhung tăm gồm 2 màu đen và be kem
                    - Quần ống suông nam lưng cao
                    - Size: freesize dưới 80kg');
                    
                    --Quần ngắn (3,4)
                    INSERT INTO "PRODUCT" VALUES 
                    (21,3,4,'Xiaozhainv Quần Đùi Denim Nữ',120000,88,'21.jpg','Xiaozhainv Quần Đùi Denim Lưng Cao Ống Rộng Cá Tính Cho Nữ',
                    '✨✨ Gói bao gồm: 1 * quần
                    🌿 4.16#Xiaozhainv.vn 
                    🌿 Chất liệu: Khác
                    🌿 Kích thước: freesize dưới 60kg');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (22,3,4,'Quần Đùi Nữ Mặc Nhà',40000,11,'22.jpg','Quần Đùi Nữ Mặc Nhà Ống Rộng Nỉ Da Cá Lovena QN02',
                    'Tên SP: Quần Đùi Nữ Mặc Nhà Ống Rộng Cotton Da Cá Lovena QN02
                    Mã SP: QN02
                    Chất liệu: Cotton da cá
                    Size: 40-65kg
                    Cam kết: 
                    - Luôn che tên sản phẩm trên hộp đóng gói, nên nàng đừng ngần ngại đặt và nhận hàng tại Lovena nhé.
                    - Hình ảnh/video thực tế do shop quay chụp. Do màn hình và điều kiện ánh sáng khác nhau, màu sắc thực tế của sản phẩm có thể chênh lệch khoảng 1-3%.
                    - Chất lượng sản phẩm được kiểm tra kỹ càng, cẩn thận và tư vấn nhiệt tình trước khi gói hàng giao cho Quý khách.
                    - Đổi, trả, hoàn tiền trong trường hợp hàng thiếu, lỗi, không đúng mô tả khi có video quay lại quá trình bóc hàng, kiểm hàng lúc kiện hàng còn nguyên vẹn.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (23,3,4,'Quần ngủ đùi nữ',49000,11,'23.jpg','Quần ngủ đùi nữ cotton VM Shop quần mặc nhà lưng thun họa tiết QSU00013',
                    'Thông tin sản phẩm
                    
                    Sản phẩm: Quần đùi nữ lưng thun họa tiết dễ thương dành cho bạn gái
                    Chất liệu: Cotton
                    Size: Freesize (<54kg) (Lưng chun co dãn)
                    Chiều dài quần 34.5cm - Ngang eo 27.5cm - Vòng mông <92cm - Ống quần 32cm - Lưng xuống đáy 22cm
                    Lưu ý 1 tí ạ: Số đo này mọi người tự ướm lên áo của chính mình đang mặc vừa để chọn size phù hợp, đừng nhân đôi lên nha khách nha ^^. Chênh lệch 1,2cm vẫn oke nè');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (24,3,4,'Quần short nam POLYS Fullbox vải Kaki Cotton',179000,59,'24.jpg','Quần short nam POLYS Fullbox vải Kaki Cotton dày dặn, co giãn và thấm hút tốt. Form regular Quần Short Kaki Nam',
                    '✅ CHI TIẾT SẢN PHẨM
                    ⚜️ Quần Short Nam Basic
                    - Được thiết kế bởi Team POLYS.
                    - Chất liệu: Kaki Cotton cao cấp, dày dặn, mềm mịn, ít nhăn, co giãn 4 chiều và thấm hút tốt. Giúp người mặc thoáng mát, không gò bó hay hầm bí. Cam kết không ra màu không bai nhãu.
                    - Dáng suông vừa, lên form thoải mái nhưng vẫn vừa vặn với người mặc.
                    - Thiết kế, trẻ trung, dễ dàng kết hợp cùng áo sơ mi áo thun hoặc polo. Có thể mặc thường ngày, đi chơi hoặc đi dạo phố đều phù hợp.
                    - Màu: xám đậm
                    
                    ✅ HƯỚNG DẪN GIẶT ỦI VÀ BẢO QUẢN
                    - Có thể giặt máy.
                    - Giặt áo với nước nhiệt độ thấp hơn 30 độ C.
                    - Không sử dụng nước tẩy.
                    - Không vắt, không phơi nắng gắt.
                    - Ủi hoặc sấy áo ở nhiệt độ thấp.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (25,3,4,'Quần đùi nam nữ unisex in hình vịt vàng',61700,60,'25.jpg','Quần đùi nam nữ unisex in hình vịt vàng chất liệu umi dày dặn form đẹp thoáng mát - REW2021',
                    '🌿 Thông tin sản phẩm 
                    - Quần Short Nam Nữ Unisex được thiết kế theo đúng form chuẩn
                    - Chất liệu:  co dãn 4 chiểu cao cấp (thoáng mát, thấm hút mồ hôi)
                    - Đem lại sự thoải mái tiện lợi nhất cho người mặc
                    - Màu sắc: Be
                    - Size: freesize
                    
                    🌿 Chính sách bán hàng sản phẩm 
                    - Cam kết giá tốt nhất thị trường, chất lượng tuyệt vời
                    - Sản phẩm cam kết như hình thật 100% 
                    - Đổi trả trong vòng 3 ngày nếu hàng lỗi, sai mẫu cho quý khách
                    - Hỗ trợ bạn mọi lúc, mọi nơi');
                    
                    -- Đồ ngủ (4,null)
                    INSERT INTO "PRODUCT" VALUES 
                    (26,4,null,'ĐỒ NGỦ PIJAMA ĐÙI VẢI ĐŨI',139000,79,'26.jpg','ĐỒ NGỦ PIJAMA ĐÙI VẢI ĐŨI SIZE 40-60KG, ĐỒ BỘ PIJAMA CỔ SEN, HOẠ TIẾT DỄ THƯƠNG, ĐỒ MẶC NHÀ MÁT MẺ, QUẦN CÓ TÚI',
                    'THÔNG TIN SẢN PHẨM:
                    Kiểu dáng : Áo cộc cổ sen, quần đùi có túi hoạ tiết dễ thương
                    Chất liệu : Vải đũi gân mềm mại dễ thương phong cách trẻ trung
                    Màu sắc : NHƯ ẢNH
                    Style: bộ mặc nhà trẻ trung
                    Kích thước: 40 - 60kg, tuỳ chiều cao
                    Dài áo 60cm, ngang ngực 100cm
                    Dài quần 38cm, ngang mông 100cm
                    * Vui Lòng Cho Phép Sai Số 1-3 Cm Do Sản Phẩm Được Đo Bằng Phương Pháp Thủ Công
                    - Đồ ngủ nữ cộc tay bộ mặc nhà dễ thương, hàng y hình. Hàng may mặc kỹ đường may chắc chắn, không chỉ thừa. Chất vải đũi, măc mịn và cực mát. Ngoài ra bỏ vào máy giặt cũng k bị nhàu hay bị phai màu.
                    - Vải đũi hàn được dệt hoàn toàn từ sợi bông, rất sự mềm mại, mỏng nhẹ và khả năng thấm hút tốt. Thành phần tự nhiên khiến vải không dễ bị xù bông, đồng thời phù hợp với làn da nhạy cảm. Được làm từ sợi tre, vải sẽ thêm mềm mịn, bền chắc và có độ kháng khuẩn cao.
                    - Chất vải dày dặn hơn, mềm mại, và độ co giãn tốt hơn, không bai nhão như sản phẩm cùng loại trên thị trường
                    Vải đũi gân mềm, loại vải rất được ưa chuộng hiện nay, cầm thích tay, thấm hút mồ hôi, rất phù hợp mặc thời tiết mùa hè.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (27,4,null,'Combo đồ ngủ hai dây chất đũi mềm thoáng mát bốn mùa nhiều họa tiết',85000,10,'27.jpg','Combo đồ ngủ hai dây chất đũi mềm thoáng mát bốn mùa nhiều họa tiết',
                    'Laem xin chào khách ạ 🌸
                    Kích thước: freesize dưới 85kg
                    
                    🌺 Tất cả đều là ảnh thật nên các tình iu cứ yên tâm nha.
                    🌾 THÔNG TIN SẢN PHẨM
                    Mẫu: hai dây
                    Chất liệu: Đũi xốp THÁI siêu thoáng, bao cả mùa hè bao thấm mồ hôi. Quần lưng thun co dãn tối đa dễ chịu.
                    Kiểu dáng: Set hai dây - quần đùi
                    HÀNG CÓ SẴN
                    CHÂN THÀNH CẢM ƠN 🍂');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (28,4,null,'Bộ Đồ Ngủ cotton Hai Dây In Hoạt Hình Dành Cho Nữ',94000,67,'28.jpg','Bộ Đồ Ngủ cotton Hai Dây In Hoạt Hình Dành Cho Nữ',
                    '1. Kích thước freesize dưới 70kg cho nữ.
                    2. Kích thước có thể có sự khác biệt 2-3 cm do đo lường thủ công. Ghi chú điều này khi đo.
                    3. Do sự thay đổi của màn hình máy tính, màu sắc sản phẩm có thể thay đổi một chút khi nhận được.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (29,4,null,'Bộ đồ pijama trung niên dài tay',159500,68,'29.jpg','Bộ đồ pijama trung niên dài tay vải cotton pha mềm mát dành cho người già loại sọc',
                    'Chúng ta biết rằng đối với người già điều gì là quan trọng nhất trong những bộ đồ mà họ mặc hằng ngày. Với tiêu chí mặc thoải mái nhẹ nhàng mát mẻ chúng tôi giới thiệu cho bạn bộ pijama cho người già này.
                    
                    THÔNG TIN SẢN PHẨM: 
                    - Sản phẩm freesize dưới 80kg
                    - Sản phẩm có nhiều màu nhiều họa tiết và mỗi thời điểm sẽ thay thế toàn bộ
                    - chất vải cotton vô cùng nhẹ mềm mát phù hợp cho người lớn tuổi
                    - Sản phẩm mặc cực kỳ thoải mái nhẹ nhàng và cực kỳ mát mẻ
                    - Form rộng rãi thoải mái để mặc nguyên 1 ngày dài
                    - Gồm những họa tiết caro nhỏ sáng sủa
                    - Đường may chắc chắn
                    - Loại đồ mặc hằng ngày
                    - Là một trong những mặc hang cơ bản của người trung niên');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (30,4,null,'Bộ đồ ngủ nữ đơn giản phong cách Nhật Bản',98000,90,'30.jpg','Ins Bộ đồ ngủ nữ đơn giản phong cách Nhật Bản ngày hè 2022 bộ đồ mặc nhà thắt nơ mới ngọt ngào và dễ thương',
                    '◾️ Hàng có sẵn, giá rẻ hơn thị trường 20-30-%
                    ◾️ Freesize dưới 80kg
                    ◾️ cam kết chỉ bán hàng chuẩn quảng châu
                    ◾️ nhận oder các mẫu khác theo ảnh, đối với hàng oder khách lưu ý không huỷ ngang khi shop đã xác nhận đơn hàng .
                    ◾️ hàng shop tự chup 100% ảnh thật chèn tên shop up cuối cùng sau ảnh mẫu, đừng ngại ngùng hãy đặt mua hàng sớm nhất để có dc sp ưng ý nhanh nhất !');
                    
                    -- Giày (5,null)
                    INSERT INTO "PRODUCT" VALUES 
                    (31,5,null,'Giày Bốt U.G.G Đế Cao Lót Bông Brown Dành Cho Nữ',2350000,193,'31.jpg','Giày Bốt U.G.G Đế Cao Lót Bông Brown Dành Cho Nữ Lai Au [ Hàng Best Quảng Châu ] [ Fullbox ]',
                    '• Size : M (size nữ)
                    
                    Đánh Giá Nhanh : Chất lượng tốt nhất trong tầm giá
                    -  Chiều cao đế 5cm
                    - Form đẹp chuẩn :  Màu sắc giống đến 95 °/ₒ ; 
                    - Chất liệu da lộn (có phấn) + nỉ + vải mesh 
                    - Lưỡi gà cao dày dặn; Wings in sắc nét; Mông mũi làm đẹp');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (32,5,null,'ENSo - Boots Da Thật Màu Đen',1490000,52,'32.jpg','ENSo - Boots Da Thật Màu Đen CHRIS Đế Cao 8,5 cm',
                    'CHRIS BOOTS - SỰ PHA TRỘN HOÀN HẢO GIỮA NÉT CÁ TÍNH HIỆN ĐẠI VÀ TÍNH ỨNG DỤNG CAO 
                    Một nét bổ sung duyên dáng cho các item mùa đông từ chiếc quần jeans bụi bặm cho tới những kiểu váy cá tính. Chris Boots là một item giúp nâng tầm outfit, mang tới vẻ ngoài High fashion cho các cô nàng ENSO năng động, hiện đại.
                    
                    1. Chi tiết sản phẩm:
                    Với điểm nhấn là phần đế cao 8,5cm chắc khoẻ với đường cong vát nhẹ hài hoà, cùng phần mũi độn cao tinh tế mang lại trải nghiệm thoải mái khi di chuyển cùng hiệu ứng vô cùng tôn dáng, Chris mang lại vẻ cá tính thời thượng và hiện đại.
                    Trên nền da Microfiber nhập khẩu cao cấp - xu hướng tiên phong thời thượng, cùng đường khâu tinh tế - Chris sẽ một lựa chọn tuyệt vời cho mùa Đông và cho mùa lễ hội cuối năm.
                    
                    2. Size: M (size nữ)');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (33,5,null,'Dép Nữ Đi Mưa',31990,209,'33.jpg','Dép Nữ Đi Mưa Siêu Xinh',
                    'Mùa mưa đến rồi! Việc mang những đôi giày khi vô tình gặp trời mưa thì thật khó chịu đúng không
                    Dép sục nữ không còn là một món đồ xa lạ mà đã trở thành một món đồ quen thuộc của rất nhiều bạn mỗi dịp hè về. Sự thoải mái và mát mẻ khiến cho nó trở thành món đồ không thể thiếu để các bạn đi biển. Shop xin giới thiệu đến các bạn đôi dép thời trang giá rẻ.
                    Kích thước: M (size nữ)
                    Chất Liệu Đế: cao su
                    Chất Liệu Quai : cao su
                    Chiều cao đế : 1.5cm
                    Mô tả sản phẩm:
                    Dép được làm từ chất liệu cao cấp, chắc chắn, dẻo dai.
                    Được thiết kế theo công nghệ mới, độ chống trơn trượt cao, mang đến cho người sử dụng cảm giác thoải mái và tự tin khi di chuyển.
                    Phong cách đơn giản nhưng vẫn hiện đại, bắt kịp xu hướng thời trang mới.');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (34,5,null,'Giày Boot Da Cổ Cao Kèm 2 Kiểu Dây',31990,209,'34.jpg','Giày Boot Da Cổ Cao Kèm 2 Kiểu Dây (hoàn trả nếu không đúng mô tả)',
                    '‼️ HÀNG CÓ SẴN - NẾU HẾT HÀNG TỨC LÀ SHOP ĐANG RESTOCK VỀ THÊM Ạ 
                    ẢNH THẬT CAM ĐOAN SHOP TỰ CHỤP 100% 
                    
                    Mua 1 giày đc 2 loại dây 😌  lên chân là như 2 đôi khác nhau luôn ý các bác ạ. Chất da đẹp mướt, đế dày ạ
                    
                    Size M (size nữ)
                    🖤🖤🖤');
                    
                    INSERT INTO "PRODUCT" VALUES 
                    (35,5,null,'Giày sneaker nam đế độn StarLord',179000,196,'35.jpg','Giày sneaker nam đế độn StarLord SL1078 phối màu phản quang',
                    'Xuất xứ: sản phẩm được sản xuất tại Tp HCM, Viet Nam.
                    Chất liệu đế: cao su 100%
                    Chất liệu thân: tổng hợp
                    Chất liệu lót: da heo
                    Chiều cao đế: 5cm
                    Size: M (size nam)
                    Thiết kế: phong cách hiện đại
                    Thương hiệu: StarLord
                    Thông tin bảo hành: Đổi trả 7 ngày');

                    INSERT INTO "PRODUCT" VALUES 
                    (36,5,null,'Dép tổ ong ASIA',55000,0,'36.jpg','Dép tổ ong ASIA,Chất liệu EVA cao cấp thân thiện với môi trường,siêu bền,siêu nhẹ,êm ái, chống trơn trượt,đế giày 3,5cm',
                    'Dép tổ ong siêu nhẹ thương hiệu ASIA.
                    Đây là phiên bản dép tổ ong mới nhất,được đúc nguyên khối từ vật liệu  EVA cao cấp,thân thiện với môi trường,an toàn cho người dùng.                    
                    Siêu nhẹ,siêu bền,mềm mại và cực êm chân                    
                    Đế dày 3,5 cm, chống trơn trượt                    
                    Sản xuất trên dây chuyền hiện đại, áp dụng công nghệ mới nhất. Form dáng chuẩn,đẹp từng centimet..                    
                    Phù hợp với mọi lứa tuổi cả Nam và Nữ, đa công dụng(đi trong nhà,đi làm,đi chơi,...)');
                `)

                //Thông báo thêm bảng thành công
                console.log(`Tables created inside database ${process.env.DB_MAINNAME}.`);
                console.log(`Data imported into database ${process.env.DB_MAINNAME}.`);

            }
            else{
                //Thông báo database đã tồn tại
                console.log(`Database ${process.env.DB_MAINNAME} already exists. Cannot create.`);

                // Kết nối đến database đã tồn tại
                db.$pool.options.database = process.env.DB_MAINNAME;
                await db.connect();

                // Thông báo kết nối thành công
                console.log(`Connected to database ${process.env.DB_MAINNAME}.`);

            }
            
        } catch (error) {
            console.log(error);
        }
    },

    db: db,
}