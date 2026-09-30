# Secure Chat

## 1. Giới thiệu

Secure Chat là ứng dụng web chat bảo mật được phát triển và chạy trên
máy local. Hiện tại dự án **chưa deploy lên web**.

Công nghệ chính:

-   Node.js
-   Express.js
-   MySQL
-   HTML, CSS, JavaScript
-   Web Crypto API
-   IndexedDB
-   `express-session`
-   Argon2
-   `mysql2`

Cơ chế mã hóa tin nhắn hiện tại sử dụng X25519, HKDF-SHA-256 và AES-GCM
256-bit. Đây là mô hình E2EE phục vụ mục đích học tập/dự án cá nhân,
chưa phải một triển khai Signal Protocol hoàn chỉnh.

------------------------------------------------------------------------

## 2. Yêu cầu

Cần cài:

-   Node.js
-   MySQL
-   Trình duyệt hiện đại hỗ trợ Web Crypto API và IndexedDB

Phiên bản Node.js đã dùng để phát triển:

``` text
Node.js v24.18.0
```

Kiểm tra:

``` bash
node -v
npm -v
mysql --version
```

------------------------------------------------------------------------

## 3. Cấu trúc project

Backend chạy từ thư mục `server`:

``` text
secure-chat/
└── server/
    ├── src/
    │   ├── server.js
    │   ├── config/
    │   │   └── database.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── userController.js
    │   │   ├── friendshipController.js
    │   │   └── keyController.js
    │   └── ...
    ├── .env
    ├── package.json
    └── ...
```

Frontend được Express cung cấp cùng ứng dụng. Các JavaScript mã hóa được
load theo thứ tự:

``` text
keyManager.js
encryption.js
decryption.js
app.js
```

------------------------------------------------------------------------

## 4. Cài đặt lần đầu

Clone project:

``` bash
git clone https://github.com/furo120625/secure-chat.git
cd secure-chat
cd server
```

Nếu project đã có sẵn trên máy, chỉ cần mở terminal tại thư mục
`server`.

Cài dependencies:

``` bash
npm install
```

------------------------------------------------------------------------

## 5. Cấu hình MySQL

Đảm bảo MySQL đang chạy và database của project đã tồn tại.

Kiểm tra:

``` bash
mysql -u root -p
```

Sau đó:

``` sql
SHOW DATABASES;
```

Tên database phải khớp với cấu hình trong `.env`.

------------------------------------------------------------------------

## 6. Tạo file `.env`

Trong thư mục `server`, tạo:

``` text
.env
```

Ví dụ:

``` env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

PORT=3000

SESSION_SECRET=your_long_random_session_secret
```

Ý nghĩa:

  Biến               Ý nghĩa
  ------------------ -------------------------
  `DB_HOST`          Địa chỉ MySQL
  `DB_USER`          Tài khoản MySQL
  `DB_PASSWORD`      Mật khẩu MySQL
  `DB_NAME`          Database của project
  `PORT`             Port Express server
  `SESSION_SECRET`   Secret dùng cho session

**Không commit `.env` lên GitHub.**

Thêm:

``` text
.env
```

vào `.gitignore`.

------------------------------------------------------------------------

## 7. Chạy server local

Từ thư mục `server`:

``` bash
node src/server.js
```

Server chạy tại:

``` text
http://localhost:3000
```

Nếu cấu hình đúng, terminal sẽ có thông báo tương tự:

``` text
Server running at http://localhost:3000
MySQL connected successfully!
```

------------------------------------------------------------------------

## 8. Mở ứng dụng

Mở trình duyệt:

``` text
http://localhost:3000
```

Không mở `index.html` bằng `file:///...`.

Ứng dụng cần Express server để frontend gọi các API và sử dụng session
cookie.

Một số API chính:

``` text
/api/auth/login
/api/auth/register
/api/auth/me
/api/users/:id
/api/friendships
/api/friendships/requests
/api/conversations
/api/messages
/api/keys/public/:userId
/api/keys/private
```

------------------------------------------------------------------------

## 9. Đăng ký và đăng nhập

Từ trang Login chọn:

``` text
Create account
```

Nhập:

``` text
Username
Email
Password
Confirm password
```

Mỗi tài khoản có một User ID dạng UUID duy nhất.

Ví dụ:

``` text
949750a7-4a03-4eb9-98ba-9107fe53094f
```

Sau khi đăng ký, đăng nhập bằng email và password.

Backend sử dụng session thông qua HTTP-only cookie.

------------------------------------------------------------------------

## 10. Key và E2EE

Frontend tạo hoặc khôi phục key pair cho user.

Luồng tổng quát:

``` text
Login
  ↓
Key Manager
  ↓
Kiểm tra IndexedDB
  ↓
Có key?
 ├── Có → sử dụng key
 └── Không
      ↓
   Kiểm tra backup trên server
      ↓
   Khôi phục key
      ↓
   Lưu lại IndexedDB
```

Public key được lưu trên server.

Private key không được lưu trực tiếp dưới dạng plaintext. Private key
được mã hóa trước khi backup bằng cơ chế dựa trên password của user.

Tin nhắn được mã hóa ở browser trước khi gửi server.

Luồng gửi message:

``` text
Plaintext
   ↓
Encrypt
   ↓
Ciphertext
   ↓
POST /api/messages
   ↓
MySQL
```

------------------------------------------------------------------------

## 11. Chạy project mỗi ngày

Sau khi đã cài đặt lần đầu:

### Bước 1

Khởi động MySQL.

### Bước 2

Mở terminal:

``` bash
cd path o\secure-chat\server
```

### Bước 3

Chạy:

``` bash
node src/server.js
```

### Bước 4

Mở:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 12. Xử lý lỗi thường gặp

### Node.js không được nhận diện

``` bash
node -v
```

Nếu không có version, cài Node.js rồi mở lại terminal.

### Dependencies bị thiếu

``` bash
npm install
```

### MySQL không kết nối

Kiểm tra:

``` text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
```

và đảm bảo MySQL đang chạy.

### `Access denied`

Kiểm tra username/password MySQL trong `.env`.

### Database không tồn tại

Kiểm tra:

``` sql
SHOW DATABASES;
```

### Server không chạy được ở port 3000

Kiểm tra xem port `3000` có đang được process khác sử dụng hay không.

### `/api/auth/me` trả về chưa authenticated

Kiểm tra:

1.  Server có đang chạy không.
2.  Login có thành công không.
3.  Browser có nhận session cookie không.
4.  Có đang truy cập `http://localhost:3000` thay vì mở file HTML trực
    tiếp không.

------------------------------------------------------------------------

## 13. Lưu ý khi test E2EE

Không nên xóa IndexedDB hoặc private key trong khi đang kiểm thử.

Browser mới hoặc Incognito có thể được dùng để mô phỏng một thiết
bị/browser chưa có dữ liệu local.

Các message cũ được tạo trước khi format lưu `self_ciphertext`,
`self_nonce` và `self_public_key` có thể không tương thích với cơ chế
giải mã hiện tại.

Không nên xóa private key nếu vẫn cần giải mã dữ liệu đã mã hóa bằng key
đó.

------------------------------------------------------------------------

## 14. Quy tắc local development

-   Không commit `.env`.
-   Không lưu plaintext password vào database.
-   Không đưa password vào source code.
-   Không log password ra terminal.
-   Không commit private key plaintext.
-   Sau khi thay đổi backend, restart Node.js server.
-   Sau khi thay đổi frontend, refresh browser.
-   Không dùng cấu hình local một cách máy móc khi deploy production.

------------------------------------------------------------------------

## 15. Kiến trúc hiện tại

``` text
Browser
   │
   │ HTTP
   ↓
Express Server
   │
   ├── Authentication
   ├── Users
   ├── Friendships
   ├── Conversations
   ├── Messages
   └── Key Backup
   │
   ↓
MySQL
```

Mã hóa message diễn ra ở browser trước khi ciphertext được gửi lên
server.

------------------------------------------------------------------------

## 16. Trạng thái dự án

``` text
Environment: Local development
URL: http://localhost:3000
Deployment: Chưa triển khai
Backend: Node.js + Express
Database: MySQL
Authentication: Session + Argon2
Encryption: X25519 + HKDF-SHA-256 + AES-GCM
Client storage: IndexedDB
Frontend: HTML + CSS + JavaScript
```

------------------------------------------------------------------------

## Quick Start

Nếu project đã được cấu hình đầy đủ:

``` bash
cd secure-chat\server
npm install
node src/server.js
```

Sau đó mở:

``` text
http://localhost:3000
```

Deployment sẽ được thực hiện ở giai đoạn sau, sau khi frontend, backend,
database, authentication, E2EE, responsive UI và security configuration
được hoàn thiện.
