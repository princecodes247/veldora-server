import mongoose from 'mongoose';
import { DATABASE_URL } from './env.config';

const connectToDatabase = async (callback: () => void) => {
  try {
    console.log('Connecting to MongoDB');
    await mongoose.connect(DATABASE_URL, {
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
    });
    console.log('Connected to MongoDB');
    callback();
  } catch (err) {
    console.error(err);
  }
  mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
  });
};

export default connectToDatabase;
