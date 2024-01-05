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

                //TODO: Thêm dữ liệu mẫu bán hàng vào database (5 category cao nhất)

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