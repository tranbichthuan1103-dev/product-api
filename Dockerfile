# Sử dụng Node.js LTS phiên bản Alpine nhỏ gọn, tối ưu tài nguyên
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json trước để tận dụng Docker cache
COPY package*.json ./

# Cài đặt production dependencies
RUN npm ci --omit=dev

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Khai báo cổng ứng dụng lắng nghe
EXPOSE 3000

# Lệnh khởi chạy server API
CMD ["node", "src/server.js"]
