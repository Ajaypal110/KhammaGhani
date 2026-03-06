import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'e:/OneDrive/Study Docs/KhammaGhani–Restaurant/Backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

const menuSchema = new mongoose.Schema({
    name: String,
    restaurant: mongoose.Schema.Types.ObjectId
});

const Menu = mongoose.model('Menu', menuSchema);

async function checkMenus() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await Menu.countDocuments();
        console.log(`Total menu items: ${count}`);
        const sample = await Menu.find().limit(5).populate({ path: 'restaurant', model: 'User', select: 'name' });
        console.log('Sample items:');
        console.log(JSON.stringify(sample, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkMenus();
