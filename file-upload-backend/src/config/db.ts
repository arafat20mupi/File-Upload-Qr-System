import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// const URI = process.env.MONGODB_URI as string
const URI = process.env.DB_HOST as string;

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
    });
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); 
  }
};

export default connectDB;