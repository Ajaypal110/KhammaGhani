import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'e:/OneDrive/Study Docs/KhammaGhani–Restaurant/Backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    name: String,
    role: String,
    email: String
});

const User = mongoose.model('User', userSchema);

async function listRestaurants() {
    try {
        await mongoose.connect(MONGO_URI);
        const restaurants = await User.find({ role: 'restaurant' });
        console.log(JSON.stringify(restaurants, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listRestaurants();
