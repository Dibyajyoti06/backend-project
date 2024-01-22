const mongoose = require('mongoose');
const DB_NAME = require('../constants');

const connectDB = async function () {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`\n MongoDB connected !! DB HOST:${connectionInstance}`);
  } catch (err) {
    console.log('MongoDB connection error', err);
    process.exit(1);
  }
};

module.exports = connectDB;
