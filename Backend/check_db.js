import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    name: String,
    role: String,
    lat: Number,
    lon: Number,
    address: String,
    city: String
});

const User = mongoose.model('User', userSchema);

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const restaurants = await User.find({ role: 'restaurant' });
        console.log("RESTAURANTS FOUND:", restaurants.length);
        restaurants.forEach(r => {
            console.log(`- ${r.name}: ${r.lat}, ${r.lon} | Addr: ${r.address} | City: ${r.city}`);
        });
        
        // Sample user address with geocoding failure address string from screenshot
        const userWithAddress = await User.findOne({ "addresses.address": /Umra/i });
        if (userWithAddress) {
            console.log("USER WITH UMRA ADDRESS FOUND:");
            const addr = userWithAddress.addresses.find(a => a.address && a.address.includes("Umra"));
            console.log(`- Address: ${addr.address} | lat: ${addr.lat}, lon: ${addr.lon}`);
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

check();
