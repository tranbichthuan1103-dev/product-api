require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Kết nối MongoDB trước khi khởi động server
    await connectDB();

    // 2. Khởi động Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check endpoint: http://localhost:${PORT}/health`);
      console.log(`Products API endpoint: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error(`Không thể khởi động server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

