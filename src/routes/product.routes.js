const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product.model');

const router = express.Router();

// 8.1. Thêm sản phẩm mới (POST /api/products)
router.post('/', async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;

    const product = new Product({
      pid,
      pname,
      price,
      quantity,
    });

    const savedProduct = await product.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    // Xử lý lỗi trùng mã sản phẩm (unique: true)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Mã sản phẩm (pid) đã tồn tại, vui lòng chọn mã khác',
      });
    }

    // Xử lý lỗi validation từ Mongoose schema
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Lỗi server khi tạo sản phẩm',
      error: error.message,
    });
  }
});

// 8.2. Lấy danh sách tất cả sản phẩm (GET /api/products)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi server khi lấy danh sách sản phẩm',
      error: error.message,
    });
  }
});

// 8.3. Lấy thông tin sản phẩm theo ID (GET /api/products/:id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra định dạng MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID sản phẩm không đúng định dạng ObjectId',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm với ID được cung cấp',
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi server khi tìm kiếm sản phẩm',
      error: error.message,
    });
  }
});

// 8.4. Cập nhật sản phẩm theo ID (PUT /api/products/:id)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra định dạng MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID sản phẩm không đúng định dạng ObjectId',
      });
    }

    // Cập nhật và bật runValidators để Mongoose kiểm tra ràng buộc schema
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm để cập nhật',
      });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    // Xử lý lỗi trùng mã sản phẩm nếu cập nhật pid trùng
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Mã sản phẩm (pid) đã tồn tại trên một sản phẩm khác',
      });
    }

    // Xử lý lỗi validation từ Mongoose schema
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Lỗi server khi cập nhật sản phẩm',
      error: error.message,
    });
  }
});

// 8.5. Xóa sản phẩm theo ID (DELETE /api/products/:id)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra định dạng MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID sản phẩm không đúng định dạng ObjectId',
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm để xóa',
      });
    }

    return res.status(200).json({
      message: 'Xóa sản phẩm thành công',
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi server khi xóa sản phẩm',
      error: error.message,
    });
  }
});

module.exports = router;

