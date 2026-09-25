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