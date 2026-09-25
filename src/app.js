const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();

// Middleware parse JSON body
app.use(express.json());

// Endpoint kiểm tra trạng thái hệ thống và kết nối MongoDB
app.get('/health', (req, res) => {
  // readyState: 1 = connected
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({
      status: 'UP',
      database: 'connected',
    });
  }

  return res.status(503).json({
    status: 'DOWN',
    database: 'disconnected',
  });
});

// Đăng ký routes sản phẩm
app.use('/api/products', productRoutes);

module.exports = app;

