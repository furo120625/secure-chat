1. Yêu cầu hệ thống

Trước khi bắt đầu, máy tính cần cài:

Git
Node.js
MySQL
Một trình soạn thảo code, khuyến nghị Visual Studio Code
Kiểm tra Git

Mở Terminal hoặc PowerShell:

git --version

Nếu Git đã được cài đặt, Terminal sẽ hiển thị phiên bản, ví dụ:

git version 2.x.x
Kiểm tra Node.js
node -v

và:

npm -v

Nếu cả hai lệnh đều trả về phiên bản thì Node.js đã được cài đặt.

Kiểm tra MySQL

Có thể sử dụng MySQL Server kết hợp với MySQL Workbench.

Kiểm tra MySQL:

mysql --version
2. Tải project từ GitHub

Clone repository:

git clone https://github.com/furo120625/secure-chat.git

Sau khi clone xong, di chuyển vào thư mục project:

cd secure-chat

Nếu sử dụng Visual Studio Code:

code .
3. Cài đặt các package

Trong thư mục project, chạy:

npm install

Lệnh này sẽ đọc file package.json và cài đặt toàn bộ dependency cần thiết.

Sau khi hoàn thành, thư mục node_modules sẽ được tạo.

Không cần đưa node_modules lên GitHub. Mỗi máy chỉ cần chạy npm install một lần sau khi clone project.

4. Cài đặt và khởi động MySQL

Secure Chat sử dụng MySQL để lưu trữ dữ liệu.

Mở MySQL Workbench hoặc MySQL Command Line Client.

Tạo database:

CREATE DATABASE secure_chat;

Sau đó:

USE secure_chat;
5. Tạo các bảng trong database

Project cần các bảng database để lưu thông tin người dùng, quan hệ bạn bè, khóa công khai và các dữ liệu liên quan.

Nếu project có file SQL được cung cấp, hãy mở file SQL đó trong MySQL Workbench và chạy toàn bộ nội dung.

Ví dụ:

database/
└── schema.sql

Trong MySQL Workbench:

Mở file schema.sql.
Chọn database secure_chat.
Chạy toàn bộ câu lệnh SQL.
Kiểm tra phần Tables để đảm bảo các bảng đã được tạo.

Không tự tạo bảng theo tên trong hướng dẫn này nếu repository đã cung cấp schema.sql. Hãy sử dụng schema đi kèm project để đảm bảo cấu trúc database đúng với source code hiện tại.

6. Tạo file .env

Project sử dụng biến môi trường để lưu thông tin kết nối database và các secret của server.

Trong thư mục server/project, tạo file:

.env

Ví dụ:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=secure_chat

SESSION_SECRET=your_session_secret
PORT=3000
Giải thích
Biến	Ý nghĩa
DB_HOST	Địa chỉ MySQL
DB_USER	Tài khoản MySQL
DB_PASSWORD	Mật khẩu MySQL
DB_NAME	Tên database
SESSION_SECRET	Secret dùng cho session
PORT	Port của Node.js server

Nếu MySQL chạy trên máy local thì thông thường:

DB_HOST=localhost

Nếu tài khoản MySQL là root:

DB_USER=root

DB_PASSWORD phải là mật khẩu MySQL của máy bạn.

Ví dụ:

DB_PASSWORD=123456

Không sử dụng nguyên mật khẩu của người khác.

7. Không đưa .env lên GitHub

File .env chứa thông tin nhạy cảm nên không được commit lên GitHub.

File .gitignore nên có:

node_modules/
.env

Mỗi người clone project sẽ tự tạo .env của riêng mình.

Có thể tạo thêm:

.env.example

Ví dụ:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=secure_chat

SESSION_SECRET=
PORT=3000

File .env.example có thể đưa lên GitHub vì nó không chứa password thật.

8. Khởi động server

Sau khi:

Clone project
Chạy npm install
Cài MySQL
Tạo database
Import database schema
Tạo .env

hãy khởi động server:

npm start

Hoặc sử dụng command được định nghĩa trong package.json.

Nếu project sử dụng:

node src/server.js

thì có thể chạy trực tiếp:

node src/server.js

Nếu server khởi động thành công, Terminal sẽ hiển thị thông báo tương tự:

Server is running on port 3000
MySQL connected
9. Mở ứng dụng

Mở trình duyệt và truy cập:

http://localhost:3000

Nếu frontend được chạy bằng một server riêng, hãy sử dụng port được cấu hình cho frontend.

10. Tạo tài khoản

Sau khi mở ứng dụng:

Chọn Create Account/Register.
Nhập username.
Nhập email nếu được yêu cầu.
Nhập password.
Đăng ký tài khoản.

Thông tin tài khoản sẽ được lưu vào database MySQL local của máy.

11. Đăng nhập

Sau khi tạo tài khoản:

Quay lại trang Login.
Nhập username/email và password.
Đăng nhập.

Nếu đăng nhập thành công, server sẽ tạo session cho người dùng.

12. User ID

Mỗi tài khoản có một User ID riêng.

User ID được sử dụng để xác định chính xác người dùng khi gửi lời mời kết bạn.

Ví dụ:

Username: example
Email: example@gmail.com
User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Có thể sử dụng User ID của người khác để tìm kiếm và gửi lời mời kết bạn.

13. Kết bạn

Để gửi lời mời kết bạn:

Đăng nhập tài khoản.
Nhập User ID của người muốn kết bạn.
Gửi Friend Request.

Người nhận có thể:

Accept
Reject

Sau khi chấp nhận, hai tài khoản sẽ trở thành bạn bè.