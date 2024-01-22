require('dotenv').config();

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

var db;
try
{
      db = pgp(connectionString);
}
catch (error) {
    console.error('Error checking connection:', error.message);

}

module.exports = {
    initDatabase: async function () {
       
        try {
            // Kiểm tra xem database đã tồn tại chưa    
            const databaseExists = await db.oneOrNone(
                'SELECT 1 FROM pg_database WHERE datname = $1',
                process.env.DB_PAYMENTNAME
            );

            // Nếu database chưa tồn tại
            if (!databaseExists) {
                // Tạo mới database
                await db.none(`CREATE DATABASE ${process.env.DB_PAYMENTNAME}`);
                console.log(`Database ${process.env.DB_PAYMENTNAME} created.`);

                // Kết nối đến database mới tạo
                db.$pool.options.database = process.env.DB_PAYMENTNAME;
                await db.connect();

                // Tạo các bảng trong database
                await db.none(`
                    DROP TABLE IF EXISTS "USER" CASCADE;
                    CREATE TABLE "USER"(
                        id int,
                        balance numeric(15,2),
                        
                        PRIMARY KEY(id)
                    );
                    
                    DROP TABLE IF EXISTS "TRANSACTION" CASCADE;
                    CREATE TABLE "TRANSACTION"(
                        id serial,
                        userid int,
                        date timestamp,
                        orderid int,
                        amount numeric (15,2),
                        currentbalance numeric(15,2),
                        
                        PRIMARY KEY(id),
                        FOREIGN KEY (userid) REFERENCES "USER"(id) ON DELETE CASCADE
                    );
                `)

                // Thêm tài khoản chính để nhận thanh toán (id = 0)
                const user = {
                    id: process.env.PAYMENT_MAINUSER_ID,
                    balance: 0,
                }
                await db.none('INSERT INTO "USER"(id, balance) VALUES(${id}, ${balance})', user);

                //Thông báo thêm bảng thành công
                console.log(`Tables created inside database ${process.env.DB_MAINNAME}.`);
                console.log(`Data imported into database ${process.env.DB_MAINNAME}.`);

            }
            else {
                //Thông báo database đã tồn tại
                console.log(`Database ${process.env.DB_PAYMENTNAME} already exists. Cannot create.`);

                // Kết nối đến database đã tồn tại
                db.$pool.options.database = process.env.DB_PAYMENTNAME;
                await db.connect();

                // Thông báo kết nối thành công
                console.log(`Connected to database ${process.env.DB_PAYMENTNAME}.`);

            }

        } catch (error) {
            console.log(error);
        }
    },

    db: db,
    isValidConnect:async function (){
        try {
            // Thực hiện truy vấn đơn, ví dụ: lấy một dòng từ một bảng có sẵn
            const result = await db.one('SELECT 1 as result');
    
            // Trả về kết quả cho client
            return { connected: true, result: result.result };
        } catch (error) {
            console.error('Error checking connection:', error.message);
    
            // Trả về thông báo lỗi cho client
            return { connected: false, error: error.message };
        }
    }
}