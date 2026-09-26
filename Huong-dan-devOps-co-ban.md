# 2. Tạo mới repository rỗng mang tên product-api trên github -> OK
# 3. Sử dụng git bash terminal trong VS Studio Code để clone về máy. -> OK
```git clone https://github.com/tranbichthuan1103-dev/product-api.git```
# 4. Kết nối Docker Desktop với Visual Studio Code.
- cai extension Docker
- ctrl + Shift + P -> reload window
test kết nối docker
	```docker ps```
	```docker info```
# 5. Tạo container MongoDB tên nammongodb
## 5.1. Tạo Docker volume
- Volume giúp dữ liệu MongoDB được lưu bền vững khi container bị dừng hoặc xóa.
"
PS D:\HK1(2026-2027)\LTHDV\github\product-api> docker volume create mongodb_data
mongodb_data
"
## 5.2 Tạo MongoDB container
```
docker run -d \  --name nammongodb \  -p 27017:27017 \  -v mongodb_data:/data/db \  -e MONGO_INITDB_ROOT_USERNAME=admin \  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \  mongo:8 
```
Kết quả:
```
PS D:\HK1(2026-2027)\LTHDV\github\product-api> docker run -d \  --name nammongodb \  -p 27017:27017 \  -v mongodb_data:/data/db \  -e MONGO_INITDB_ROOT_USERNAME=admin \  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \  mongo:8
docker: invalid reference format

Run 'docker run --help' for more information

What's next:
    Debug this container error with Gordon → docker ai "help me fix this container error"
PS D:\HK1(2026-2027)\LTHDV\github\product-api> docker run -d   --name nammongodb -p 27017:27017 -v mongodb_data:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin  -e MONGO_INITDB_ROOT_PASSWORD=admin123  mongo:8
Unable to find image 'mongo:8' locally
8: Pulling from library/mongo
edd1ed89f0d4: Pull complete 
452c7dd3efc2: Pull complete 
629b21fcd7ff: Pull complete 
00c2e1442598: Pull complete 
6924226aa25f: Pull complete 
bbd0b49c84d6: Pull complete 
d05cf6da107e: Pull complete 
dfc8c140f336: Pull complete 
0839c978e1a1: Download complete 
d795988cb817: Download complete 
Digest: sha256:5d7043a4ffe02b9ed1b6e0bab057546981af5ca0a79107e9c461e49bc44c0a7b
Status: Downloaded newer image for mongo:8
97cafe925174cc716690510bc46939964526f85f16c1b98b2f500b6c08539c52
```
## 5.3. Kiểm tra container
```
docker ps
```
Bạn cần thấy container:`nammongodb`

- Kiểm tra log:
```
docker logs nammongodb
```

## 5.4. Kiểm tra MongoDB bên trong container
``` nhớ past vô terminal là 1 dòng nhé e
docker exec -it nammongodb mongosh \
  -u admin \
  -p admin123 \
  --authenticationDatabase admin
```
kết nối thành công !

- Sau khi vào MongoDB Shell:
```
db.adminCommand({ ping: 1 })
```
- Kết quả mong đợi:
```
{ ok: 1 }
```
- Thoát:
```
exit
```
## 5.5. Cách kết nối từ máy host

Ở giai đoạn chạy API trực tiếp bằng Node.js trên máy, connection string có thể là:
```
MONGO_URI=mongodb://admin:admin123@localhost:27017/productdb?authSource=admin
```
Nhưng khi API chạy trong container Docker Compose, không dùng localhost để kết nối đến MongoDB container. Khi đó, dùng tên service Docker, ví dụ:
```
MONGO_URI=mongodb://admin:admin123@mongodb:27017/productdb?authSource=admin
```
Đây là điểm rất quan trọng trong bài MSA/Docker.

# 6. Dùng AI chạy PROMPT 2: Monolithic 
```
Thiết lập hướng dẫn mức cơ bản và diễn giải cụ thể từng bước. Sau mỗi hướng dẫn thì AI kiểm tra và đánh giá khách quan.
Dựa vào sơ đồ database diagram trong hình đính kém. Hãy hướng dẫn tạo dự án RESTful API cho hệ thống thương mại điện tử phiên bản Minimum Viable Product (MVP) với Node JS, Express Js, Prisma, PostgreSQL database. 
Bên cạnh các chức năng của backend, ứng dụng cần đảm bảo các yêu cầu cơ bản như sau: 
1. Cấu hình hệ thống trong file .env
2. Sử dụng JWT trong bảo mật hệ thống
3. Dockerize ứng dụng với Docker Compose
4. Thực hiện health check cho ứng dụng

.\product-api\E-commerce-database-diagram.png
```

ủa e tưởng 2 promt là khác nhau, giống nhau hả?

cái trên là để luyện tập, vì chỉ có 1 bảng
cồn cái dưới là full chuc nang
nhưng mà thầy chấm theo từng promt mà 

vạy phải làm rieng tung cai. thấy e lấy hình promt dưới tuỏng muốn làm full , tại đầu thầy gửi cái hình đó dưới pr1 sau đó thu hồi gửi lại nên e tưởng nó của bài 1, OH

---

# 12. Tiến hành thực hiện CD với Docker Hub (Đảm bảo Healthcheck trong bước CI)

## 12.1. Kiến trúc luồng CI/CD Pipeline
Quy trình tự động hóa được thiết lập trong `.github/workflows/test-productci-prod.yml` gồm 2 giai đoạn (Jobs) tuần tự và có điều kiện ràng buộc:

```
[ Git Push / PR ]
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. PRODUCTION CI PIPELINE (ci-pipeline)                     │
│    - Setup Node 20 LTS & npm ci                             │
│    - Build Docker Image (Production)                        │
│    - Khởi chạy Docker Compose (product-api + nammongodb)    │
│    - [BẮT BUỘC] Xác thực Healthcheck 2 tầng:                │
│        + Tầng 1 (Docker Daemon): Container đạt (healthy)   │
│        + Tầng 2 (Application API): Endpoint /health trả    │
│          về status: 'UP' & database: 'connected'            │
│    - Chạy bộ kiểm thử Jest (Automated Tests)                │
│    - Chạy bộ test tích hợp toàn diện CRUD API & validation  │
│    - Dọn dẹp môi trường (docker compose down -v)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
               (CI & Healthcheck Thành công 100%)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DOCKER HUB CD PIPELINE (cd-pipeline)                     │
│    - Ràng buộc: `needs: production-ci-pipeline`             │
│    - Thiết lập Docker Buildx                                │
│    - Xác thực đăng nhập Docker Hub qua GitHub Secrets       │
│    - Trích xuất metadata và đánh nhãn đa tầng:              │
│        + :latest                                            │
│        + :sha-<short_commit_sha>                            │
│        + :<branch_name>                                     │
│    - Build và đẩy Image hoàn thiện lên Docker Hub Registry  │
└─────────────────────────────────────────────────────────────┘
```

## 12.2. Cơ chế đảm bảo Healthcheck trong bước CI
1. **Container-level Healthcheck**: Sử dụng lệnh `docker inspect` kiểm tra định kỳ trạng thái sức khỏe do Docker engine theo dõi. Cả hai dịch vụ `nammongodb` và `product-api` đều phải đạt trạng thái `healthy`.
2. **HTTP Endpoint Healthcheck**: Gửi request trực tiếp đến `http://localhost:3000/health`. API chỉ được coi là hợp lệ khi trả về mã HTTP `200` cùng cấu trúc:
   ```json
   {
     "status": "UP",
     "database": "connected"
   }
   ```
3. **Cơ chế Gating**: Nếu container bị lỗi kết nối MongoDB (ví dụ: database down), endpoint trả về `503`, bước Healthcheck lập tức kích hoạt `exit 1`. Khi đó toàn bộ CI Pipeline sẽ **FAILED**, và GitHub Actions sẽ **chặn hoàn toàn** bước CD, đảm bảo không có image lỗi nào được đẩy lên Docker Hub.

## 12.3. Hướng dẫn cấu hình GitHub Secrets
Để bước CD có thể xác thực và đẩy Docker Image lên Docker Hub, cần bổ sung 2 secrets vào GitHub Repository:

1. **Bước 1: Tạo Access Token trên Docker Hub**
   - Đăng nhập vào [Docker Hub](https://hub.docker.com/).
   - Chọn **Account Settings** -> **Security** -> **New Access Token**.
   - Đặt tên mô tả (ví dụ: `github-actions-cd`) với quyền **Read & Write**.
   - Sao chép chuỗi Token được cấp.

2. **Bước 2: Cấu hình Secret trong GitHub Repository**
   - Truy cập vào Repository trên GitHub: `tranbichthuan1103-dev/product-api`.
   - Vào mục **Settings** -> **Secrets and variables** -> **Actions**.
   - Nhấn **New repository secret** và thêm lần lượt 2 biến:
     - `DOCKERHUB_USERNAME`: Tên tài khoản Docker Hub của bạn (ví dụ: `tranbichthuan1103`). *(Lưu ý: Không để khoảng trắng / dấu cách thừa ở đầu hoặc cuối)*.
     - `DOCKERHUB_TOKEN`: Chuỗi Access Token vừa tạo ở Bước 1. *(Lưu ý: Không để khoảng trắng / dấu cách thừa)*.

## 12.4. Kiểm tra kết quả triển khai
1. Mỗi khi `push` code lên branch `main` hoặc `Prompt-1`, GitHub Actions sẽ tự động kích hoạt workflow.
2. Kiểm tra tab **Actions** trên GitHub để theo dõi tiến trình:
   - Job `Production CI & CRUD Verification Pipeline` chạy trước và xanh (Success).
   - Job `CD Pipeline - Deploy to Docker Hub` được kích hoạt và hoàn tất đẩy image.
3. Truy cập Docker Hub: Image `username/product-api` sẽ xuất hiện với đầy đủ các tag (`latest`, `sha-xxx`,...).

---

# 13. Tạo docker-compose-prod.yaml và chạy container từ Docker Hub trên Local Docker Engine sau khi CD

## 13.1. Mục đích và sự khác biệt
- **`docker-compose.yml` (Development / Local Build)**: Chứa chỉ thị `build: .` để biên dịch trực tiếp từ mã nguồn local. Sử dụng trong quá trình phát triển ứng dụng hoặc trong bước kiểm thử CI Pipeline.
- **`docker-compose-prod.yaml` (Production Deployment)**: Không biên dịch mã nguồn local mà chỉ định trực tiếp `image: ${DOCKERHUB_USERNAME:-tranbichthuan1103}/product-api:${IMAGE_TAG:-latest}` từ Docker Hub Registry cùng chỉ thị `pull_policy: always`. Điều này đảm bảo môi trường local/staging/server luôn chạy đúng bản build đã được CI kiểm thử vượt qua và CD đóng gói đẩy lên Docker Hub.

## 13.2. Cấu trúc cấu hình `docker-compose-prod.yaml`
```yaml
services:
  mongodb:
    image: mongo:8
    container_name: nammongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongodb_data:/data/db
    networks:
      - product_net
    healthcheck:
      test: ["CMD", "mongosh", "-u", "admin", "-p", "admin123", "--authenticationDatabase", "admin", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  product-api:
    image: ${DOCKERHUB_USERNAME:-tranbichthuan1103}/product-api:${IMAGE_TAG:-latest}
    pull_policy: always
    container_name: product-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGO_URI: mongodb://admin:admin123@mongodb:27017/productdb?authSource=admin
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - product_net
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 5s

volumes:
  mongodb_data:
    name: mongodb_data

networks:
  product_net:
    driver: bridge
```

## 13.3. Các bước kéo image và khởi chạy trên Local Docker Engine

### Bước 1: Kéo (Pull) image mới nhất từ Docker Hub về máy
```bash
docker compose -f docker-compose-prod.yaml pull
```
*(Hoặc chỉ định tag cụ thể nếu cần: `$env:IMAGE_TAG="sha-xxxx"; docker compose -f docker-compose-prod.yaml pull`)*

### Bước 2: Khởi động hệ thống Production ở chế độ nền
```bash
docker compose -f docker-compose-prod.yaml up -d
```
> Khi chạy lệnh này, Docker Compose sẽ tự động nhận diện nếu có container cũ đang chạy để recreate (tạo mới) container bằng Image vừa kéo từ Docker Hub.

### Bước 3: Xác thực container đang chạy Image từ Docker Hub
Kiểm tra danh sách container và trạng thái Healthcheck:
```bash
docker compose -f docker-compose-prod.yaml ps
```
Hoặc dùng lệnh Docker Native:
```bash
docker ps
```
**Kết quả mong đợi:**
- Cột `IMAGE` hiển thị `tranbichthuan1103/product-api:latest`.
- Cột `STATUS` hiển thị `Up ... (healthy)`.

### Bước 4: Kiểm tra log khởi động của API
```bash
docker compose -f docker-compose-prod.yaml logs -f product-api
```

### Bước 5: Kiểm tra trạng thái ứng dụng qua endpoint Healthcheck
Sử dụng curl hoặc PowerShell:
```bash
curl http://localhost:3000/health
```
**Kết quả JSON trả về:**
```json
{"status":"UP","database":"connected"}
```

## 13.4. Dọn dẹp và dừng hệ thống
- Tắt các dịch vụ Production:
  ```bash
  docker compose -f docker-compose-prod.yaml down
  ```
- Tắt và xóa toàn bộ kèm theo volume dữ liệu (nếu muốn reset trắng database):
  ```bash
  docker compose -f docker-compose-prod.yaml down -v
  ```

