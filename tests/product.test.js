const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/product.model');
require('dotenv').config();

describe('Product API & Health Check Tests', () => {
  let createdProductId;

  beforeAll(async () => {
    const mongoURI =
      process.env.MONGO_URI ||
      'mongodb://admin:admin123@localhost:27017/productdb?authSource=admin';
    await mongoose.connect(mongoURI);
    // Đảm bảo index unique được tạo xong
    await Product.init();
    // Dọn dẹp dữ liệu test cũ nếu có
    await Product.deleteMany({ pid: { $regex: /^TEST_/ } });
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test và đóng kết nối
    await Product.deleteMany({ pid: { $regex: /^TEST_/ } });
    await mongoose.connection.close();
  });

  describe('GET /health', () => {
    it('trả về status 200 và database connected khi kết nối MongoDB sẵn sàng', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: 'UP',
        database: 'connected',
      });
    });
  });

  describe('POST /api/products', () => {
    it('tạo mới sản phẩm thành công khi dữ liệu hợp lệ (HTTP 201)', async () => {
      const newProduct = {
        pid: 'TEST_P001',
        pname: 'Laptop Test Model',
        price: 15000000,
        quantity: 10,
      };

      const res = await request(app).post('/api/products').send(newProduct);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.pid).toBe('TEST_P001');
      expect(res.body.pname).toBe('Laptop Test Model');
      expect(res.body.price).toBe(15000000);
      expect(res.body.quantity).toBe(10);

      createdProductId = res.body._id;
    });

    it('báo lỗi khi thiếu trường bắt buộc (HTTP 400)', async () => {
      const invalidProduct = {
        pid: 'TEST_P002',
        // thiếu pname và price
      };

      const res = await request(app).post('/api/products').send(invalidProduct);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('báo lỗi khi giá là số âm (HTTP 400)', async () => {
      const invalidProduct = {
        pid: 'TEST_P003',
        pname: 'Test Negative Price',
        price: -5000,
        quantity: 2,
      };

      const res = await request(app).post('/api/products').send(invalidProduct);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('báo lỗi khi trùng mã pid (HTTP 400)', async () => {
      const duplicateProduct = {
        pid: 'TEST_P001',
        pname: 'Laptop Duplicate PID',
        price: 20000000,
        quantity: 5,
      };

      const res = await request(app).post('/api/products').send(duplicateProduct);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('pid');
    });
  });

  describe('GET /api/products', () => {
    it('lấy danh sách tất cả sản phẩm thành công (HTTP 200)', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('lấy chi tiết sản phẩm theo _id hợp lệ (HTTP 200)', async () => {
      const res = await request(app).get(`/api/products/${createdProductId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(createdProductId);
      expect(res.body.pid).toBe('TEST_P001');
    });

    it('trả về 404 khi _id không tồn tại trong database', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${nonExistentId}`);
      expect(res.statusCode).toBe(404);
    });

    it('trả về 400 khi _id sai định dạng ObjectId', async () => {
      const res = await request(app).get('/api/products/invalid-id-123');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('cập nhật sản phẩm thành công (HTTP 200)', async () => {
      const updateData = {
        pname: 'Laptop Test Model Updated',
        price: 18000000,
        quantity: 15,
      };

      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.pname).toBe('Laptop Test Model Updated');
      expect(res.body.price).toBe(18000000);
      expect(res.body.quantity).toBe(15);
    });

    it('báo lỗi khi cập nhật giá trị không hợp lệ (HTTP 400)', async () => {
      const invalidData = {
        price: -100,
      };

      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });

    it('trả về 404 khi cập nhật _id không tồn tại', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .send({ pname: 'Non Existent' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('xóa sản phẩm thành công (HTTP 200)', async () => {
      const res = await request(app).delete(`/api/products/${createdProductId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Xác minh sản phẩm đã bị xóa khỏi database
      const verifyRes = await request(app).get(`/api/products/${createdProductId}`);
      expect(verifyRes.statusCode).toBe(404);
    });

    it('trả về 404 khi xóa sản phẩm không tồn tại', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/products/${nonExistentId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
