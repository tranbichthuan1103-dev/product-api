Bạn là một lập trình viên Backend Node.js có kinh nghiệm. Hãy thực hiện **BƯỚC 6: Xây dựng RESTful CRUD API cho Product** trong workspace hiện tại của tôi.

### 1. Kiểm tra trước khi thực hiện

* Kiểm tra thư mục workspace hiện tại.
* Đọc các file đã tồn tại, đặc biệt là `package.json`, `.env`, `.gitignore` và các thư mục `src`.
* Kiểm tra xem Bước 1–5 đã được thực hiện như thế nào.
* Không xóa hoặc ghi đè các file hiện có nếu không cần thiết.
* Nếu đã có code tương tự, hãy tái sử dụng và chỉnh sửa cho phù hợp.
* Không thực hiện các bước Docker Compose, GitHub Actions CI/CD hoặc triển khai production ở bước này.

### 2. Mục tiêu của Bước 6

Xây dựng RESTful API quản lý sản phẩm bằng:

* Node.js
* Express.js
* Mongoose
* MongoDB
* dotenv
* Jest và Supertest cho kiểm thử cơ bản

API phải kết nối được đến MongoDB container hiện tại có tên:

`nammongodb`

MongoDB đang chạy trên cổng:

`27017`

Thông tin kết nối MongoDB local:

* Username: `admin`
* Password: `admin123`
* Authentication database: `admin`
* Database sử dụng cho project: `productdb`

### 3. Cấu hình project

Nếu chưa được cấu hình, hãy thực hiện:

1. Khởi tạo `package.json` bằng `npm init -y`.
2. Cài đặt dependencies:

```bash
npm install express mongoose dotenv
```

3. Cài đặt dev dependencies:

```bash
npm install -D jest supertest
```

4. Cấu hình các scripts trong `package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest --runInBand"
  }
}
```

Không xóa các scripts hiện có nếu chúng vẫn cần thiết.

### 4. Tạo cấu trúc thư mục

Tạo hoặc hoàn thiện cấu trúc sau:

```text
product-api/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── product.model.js
│   ├── routes/
│   │   └── product.routes.js
│   ├── app.js
│   └── server.js
├── tests/
├── .env
├── .env.example
├── .gitignore
└── package.json
```

### 5. Cấu hình biến môi trường

Tạo file `.env` với nội dung:

```env
PORT=3000
MONGO_URI=mongodb://admin:admin123@localhost:27017/productdb?authSource=admin
```

Tạo file `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb://admin:admin123@localhost:27017/productdb?authSource=admin
```

Thêm `.env` vào `.gitignore` để không đưa thông tin đăng nhập lên GitHub.

Nếu file `.gitignore` đã tồn tại, hãy giữ nguyên các cấu hình cần thiết và bổ sung:

```gitignore
node_modules/
.env
coverage/
```

### 6. Tạo chức năng kết nối MongoDB

Tạo file `src/config/db.js`.

Yêu cầu:

* Sử dụng `mongoose.connect()`.
* Đọc chuỗi kết nối từ `process.env.MONGO_URI`.
* Có xử lý lỗi kết nối rõ ràng.
* Không hard-code chuỗi kết nối trong file JavaScript.
* Export hàm kết nối để sử dụng trong `server.js`.

### 7. Tạo Product Model

Tạo file `src/models/product.model.js`.

Product có các thuộc tính:

| Thuộc tính | Kiểu dữ liệu | Yêu cầu                         |
| ---------- | ------------ | ------------------------------- |
| `pid`      | String       | Bắt buộc, duy nhất              |
| `pname`    | String       | Bắt buộc                        |
| `price`    | Number       | Bắt buộc, lớn hơn hoặc bằng 0   |
| `quantity` | Number       | Mặc định 0, lớn hơn hoặc bằng 0 |

Yêu cầu:

* Sử dụng Mongoose Schema.
* Bật validation cho dữ liệu.
* Không cho phép `price` hoặc `quantity` là số âm.
* Export model có tên `Product`.

### 8. Xây dựng RESTful CRUD API

Tạo file `src/routes/product.routes.js`.

Sử dụng router của Express và tạo các endpoint sau:

#### 8.1. Thêm sản phẩm

```http
POST /api/products
```

Request body mẫu:

```json
{
  "pid": "P001",
  "pname": "Laptop Dell",
  "price": 15000000,
  "quantity": 10
}
```

Yêu cầu:

* Kiểm tra dữ liệu đầu vào.
* Tạo sản phẩm mới trong MongoDB.
* Trả về HTTP status `201` khi thành công.
* Trả về lỗi phù hợp nếu `pid` bị trùng hoặc dữ liệu không hợp lệ.

#### 8.2. Lấy danh sách sản phẩm

```http
GET /api/products
```

Yêu cầu:

* Lấy tất cả sản phẩm từ MongoDB.
* Trả về HTTP status `200`.
* Trả về dữ liệu ở định dạng JSON.

#### 8.3. Lấy sản phẩm theo ID

```http
GET /api/products/:id
```

Yêu cầu:

* Sử dụng MongoDB `_id` làm route parameter.
* Trả về sản phẩm nếu tìm thấy.
* Trả về `404` nếu không tìm thấy.
* Xử lý trường hợp `_id` không hợp lệ.

#### 8.4. Cập nhật sản phẩm

```http
PUT /api/products/:id
```

Yêu cầu:

* Cập nhật thông tin sản phẩm theo `_id`.
* Kiểm tra dữ liệu đầu vào.
* Bật validation khi cập nhật.
* Trả về `404` nếu không tìm thấy.
* Trả về dữ liệu sản phẩm sau khi cập nhật.

#### 8.5. Xóa sản phẩm

```http
DELETE /api/products/:id
```

Yêu cầu:

* Xóa sản phẩm theo `_id`.
* Trả về `404` nếu không tìm thấy.
* Trả về thông báo thành công nếu xóa được.

### 9. Tạo Express App

Tạo file `src/app.js`.

Yêu cầu:

* Import Express.
* Import các routes sản phẩm.
* Sử dụng middleware `express.json()`.
* Đăng ký route `/api/products`.
* Tạo endpoint kiểm tra trạng thái:

```http
GET /health
```

Endpoint `/health` cần kiểm tra trạng thái kết nối MongoDB:

* Nếu MongoDB kết nối thành công: trả về HTTP `200`.
* Nếu MongoDB chưa kết nối: trả về HTTP `503`.

Ví dụ response khi kết nối thành công:

```json
{
  "status": "UP",
  "database": "connected"
}
```

Export `app` để có thể sử dụng trong server và kiểm thử.

### 10. Tạo Server

Tạo file `src/server.js`.

Yêu cầu:

* Load biến môi trường bằng `dotenv`.
* Kết nối MongoDB trước khi khởi động server.
* Khởi động Express trên port được cấu hình trong `.env`.
* Hiển thị thông báo rõ ràng khi server khởi động thành công.
* Xử lý lỗi kết nối MongoDB.

### 11. Kiểm thử kết nối

Sau khi hoàn thành code:

1. Kiểm tra container MongoDB có đang chạy không bằng:

```powershell
docker ps
```

2. Khởi động API:

```powershell
npm start
```

3. Kiểm tra endpoint:

```http
GET http://localhost:3000/health
```

4. Nếu cần kiểm tra MongoDB, sử dụng PowerShell command:

```powershell
docker exec -it nammongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

Không sử dụng dấu `\` để xuống dòng trong PowerShell.

### 12. Kiểm tra API

Hướng dẫn tôi kiểm tra bằng Postman hoặc REST Client với các trường hợp:

* POST tạo sản phẩm hợp lệ.
* POST thiếu trường bắt buộc.
* POST có `price` âm.
* POST có `pid` trùng.
* GET danh sách sản phẩm.
* GET sản phẩm theo `_id` hợp lệ.
* GET với `_id` không tồn tại.
* PUT cập nhật sản phẩm.
* DELETE sản phẩm.

### 13. Yêu cầu về chất lượng code

* Code dễ đọc, phù hợp với sinh viên mới học Node.js.
* Sử dụng `async/await`.
* Có `try/catch` để xử lý lỗi.
* Trả về HTTP status code phù hợp.
* Không sử dụng dữ liệu giả thay cho MongoDB.
* Không hard-code thông tin nhạy cảm ngoài `.env`.
* Không tạo thêm thư viện hoặc kiến trúc phức tạp khi chưa cần thiết.
* Giữ code đơn giản và dễ giải thích khi thuyết trình.

### 14. Báo cáo kết quả

Sau khi thực hiện, hãy báo cáo:

1. Những file đã tạo hoặc chỉnh sửa.
2. Những chức năng API đã hoàn thành.
3. Các lệnh đã chạy.
4. Kết quả kiểm tra kết nối MongoDB.
5. Kết quả chạy server.
6. Các lỗi còn tồn tại nếu có.
7. Hướng dẫn chính xác để tôi kiểm tra API bằng Postman.

**Quan trọng:**

* Trước khi chỉnh sửa file, hãy đọc nội dung file hiện tại.
* Không chuyển sang Bước 7 nếu Bước 6 chưa hoàn thành.
* Nếu gặp lỗi, hãy giải thích nguyên nhân và tự sửa lỗi trong phạm vi workspace.
* Sau mỗi thay đổi quan trọng, hãy kiểm tra lại code.

hông ấy mai ra cà phê a chỉ lại cho e đi
e k hiểu gì luôn:))

chưa hieu docker la gi pk

hông hiểu gì luôn á, thấy chạy chay mà k hiểu gì

cái đang chạy hay cái hồi nãy 
cái nãy thì còn hiểu hiểu mà k nhớ lệnh hình như chỉ là cấu hình rồi cài đặt này kia , còn cái đang chạy k hiểu cách làm, k hiểu cơ chế của nó luôn.
cái đang chạy là nhân viên AI đang làm mà, mà làm sao để nó lm và nó lm trực tiếp vào fodel mình luôn hả
đúng ròi. gọi là Agent, còn chat là Ask

thấy a cứ submit submit chớ có hiểu gì đâu, k biết nó dựa vào cơ sở gì luon

nó tạo source với test server mới cần chạy nhiều vậy á