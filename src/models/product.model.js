const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    pid: {
      type: String,
      required: [true, 'Mã sản phẩm (pid) là bắt buộc'],
      unique: true,
      trim: true,
    },
    pname: {
      type: String,
      required: [true, 'Tên sản phẩm (pname) là bắt buộc'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm (price) là bắt buộc'],
      min: [0, 'Giá sản phẩm phải lớn hơn hoặc bằng 0'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

