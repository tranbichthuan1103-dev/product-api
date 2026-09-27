# Product API (RESTful CRUD Service)

Dự án RESTful API quản lý danh mục sản phẩm (Product), được xây dựng bằng **Node.js, Express, Mongoose, MongoDB** và đóng gói hoàn chỉnh bằng **Docker & Docker Compose**.

---

## 1. Kiến trúc hệ thống & Docker Compose

Hệ thống được điều phối bằng **Docker Compose** bao gồm 2 services độc lập kết nối qua mạng nội bộ `product_net`:

1. **`mongodb`** (Container name: `nammongodb`):
   - Image: `mongo:8`
   - Port: `27017:27017`
   - Volume: `mongodb_data` (lưu trữ bền vững dữ liệu)
   - Healthcheck: Kiểm tra định kỳ bằng `mongosh` ping command.

2. **`product-api`** (Container name: `product-api`):
   - Image: Xây dựng từ `Dockerfile` (Node 20 Alpine)
   - Port: `3000:3000`
   - Kết nối MongoDB thông qua service name: `mongodb://admin:admin123@mongodb:27017/productdb?authSource=admin`
   - Phụ thuộc: `depends_on: mongodb` với điều kiện `service_healthy`.
   - Healthcheck: Kiểm tra định kỳ endpoint `/health`.

---

## 2. Hướng dẫn sử dụng Docker Compose

### 2.1. Khởi động toàn bộ hệ thống
Khởi chạy cả MongoDB và API ở chế độ chạy nền (detached mode):
```bash
docker compose up -d
```

### 2.2. Kiểm tra trạng thái các service và Healthcheck
Xem danh sách containers, cổng mapping và tình trạng sức khỏe:
```bash
docker compose ps
```
> Trạng thái hiển thị `(healthy)` cho cả 2 container báo hiệu hệ thống đã sẵn sàng 100%.

### 2.3. Xem logs hệ thống theo thời gian thực
- Xem toàn bộ logs:
  ```bash
  docker compose logs -f
  ```
- Xem riêng logs của API:
  ```bash
  docker compose logs -f product-api
  ```
- Xem riêng logs của MongoDB:
  ```bash
  docker compose logs -f mongodb
  ```

### 2.4. Build lại Docker image khi cập nhật code
Khi bạn chỉnh sửa mã nguồn trong thư mục `src/`, hãy build lại và áp dụng ngay:
```bash
docker compose up -d --build
```

### 2.5. Truy cập dòng lệnh bên trong container (Exec)
- Vào Mongo Shell (`mongosh`) để truy vấn cơ sở dữ liệu:
  ```bash
  docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
  ```
- Vào shell của container API:
  ```bash
  docker compose exec product-api sh
  ```

### 2.6. Tạm dừng và tiếp tục
- Tạm dừng (Pause): `docker compose pause`
- Bỏ tạm dừng (Unpause): `docker compose unpause`
- Dừng container (Stop): `docker compose stop`
- Bật lại container (Start): `docker compose start`

### 2.7. Tắt và hạ hệ thống
- Tắt và xóa container, network (dữ liệu trên volume `mongodb_data` vẫn được giữ nguyên an toàn):
  ```bash
  docker compose down
  ```
- Tắt và xóa toàn bộ kèm theo volumes (chỉ dùng khi muốn reset trắng dữ liệu):
  ```bash
  docker compose down -v
  ```

---

## 3. Danh sách RESTful API Endpoints

Cơ sở URL: `http://localhost:3000`

| Method | Endpoint | Mô tả | Body mẫu / Ghi chú |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái server & MongoDB | Không có |
| `POST` | `/api/products` | Thêm mới một sản phẩm | `{"pid":"P001","pname":"Laptop","price":15000000,"quantity":10}` |
| `GET` | `/api/products` | Lấy danh sách toàn bộ sản phẩm | Không có |
| `GET` | `/api/products/:id` | Lấy thông tin chi tiết sản phẩm | `:id` là MongoDB ObjectId |
| `PUT` | `/api/products/:id` | Cập nhật thông tin sản phẩm | `{"pname":"Laptop Dell","price":16000000}` |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm khỏi hệ thống | `:id` là MongoDB ObjectId |

---

## 4. Chạy trực tiếp trên máy không dùng Docker (Local Development)

1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Cấu hình file `.env`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://admin:admin123@localhost:27017/productdb?authSource=admin
   ```
3. Chạy ứng dụng:
   - Chạy production: `npm start`
   - Chạy chế độ watch tự reload: `npm run dev`
   - Chạy kiểm thử tự động: `npm test`

---

## 5. Quy trình CI/CD với GitHub Actions & Docker Hub

Quy trình CI/CD tự động hóa được thiết lập tại [`.github/workflows/test-productci-prod.yml`](.github/workflows/test-productci-prod.yml):

1. **Giai đoạn CI (Continuous Integration)**:
   - Tự động chạy khi có `push` hoặc `pull_request` vào branch `main` / `Prompt-1`.
   - Khởi chạy toàn bộ hệ thống bằng Docker Compose (`product-api` và `nammongodb`).
   - **Đảm bảo Healthcheck nghiêm ngặt**:
     - Kiểm tra trạng thái Docker Native Healthcheck của từng container (`docker inspect`).
     - Kiểm tra phản hồi thực tế từ endpoint `GET /health` (`status: UP`, `database: connected`).
     - Nếu Healthcheck hoặc bất kỳ bài test nào thất bại, quy trình CI sẽ dừng ngay lập tức.
   - Chạy bộ kiểm thử tự động (Jest) và toàn bộ các kịch bản CRUD, xử lý ngoại lệ.

2. **Giai đoạn CD (Continuous Deployment)**:
   - **Điều kiện tiên quyết**: Phụ thuộc trực tiếp vào bước CI (`needs: production-ci-pipeline`). Chỉ khi CI và Healthcheck hoàn toàn vượt qua thì CD mới được chạy.
   - Tự động đăng nhập vào Docker Hub sử dụng GitHub Secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
   - Đóng gói Docker Image và tự động đánh nhãn (`latest`, `sha-<commit>`, `<branch>`).
   - Đẩy (Push) image hoàn chỉnh lên Docker Hub Registry.

---

## 6. Triển khai Production từ Docker Hub (`docker-compose-prod.yaml`)

Sau khi CD Pipeline đẩy image thành công lên Docker Hub, bạn có thể triển khai hệ thống trên bất kỳ máy chủ hoặc Docker Engine local nào mà **không cần mã nguồn hoặc build lại image**:

1. **Kéo image mới nhất từ Docker Hub**:
   ```bash
   docker compose -f docker-compose-prod.yaml pull
   ```

2. **Khởi chạy hệ thống**:
   ```bash
   docker compose -f docker-compose-prod.yaml up -d
   ```

3. **Kiểm tra trạng thái (Container chạy từ image Docker Hub & Healthy)**:
   ```bash
   docker compose -f docker-compose-prod.yaml ps
   docker ps
   ```

4. **Kiểm tra Healthcheck Endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

5. **Dừng hệ thống**:
   ```bash
   docker compose -f docker-compose-prod.yaml down
   ```


