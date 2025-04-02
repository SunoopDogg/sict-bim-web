import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

export const connectDB = await MongoClient.connect(uri);
