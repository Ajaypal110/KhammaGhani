import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const MONGO_URI = "mongodb+srv://ajaypalsingh82775_db_user:110125@khammaghani.qtiwlxe.mongodb.net/khammaghani?retryWrites=true&w=majority&appName=Cluster0";

async function checkGeocoding() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const restaurants = await User.find({ role: 'restaurant' });
        console.log(`\n--- Checking ${restaurants.length} Restaurants ---`);
        for (const res of restaurants) {
            console.log(`\nRestaurant: ${res.name}`);
            console.log(`Stored Lat/Lon: ${res.lat}, ${res.lon}`);
            console.log(`Address: ${res.address}`);

            const queries = [res.address, `${res.name}, ${res.city || ""}`, res.city].filter(Boolean);
            for (const q of queries) {
                const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
                    headers: { 'User-Agent': 'KhammaGhani-Diagnostic' }
                });
                const data = await resp.json();
                if (data && data.length > 0) {
                    console.log(`✅ Found geographic match for query "${q}": ${data[0].lat}, ${data[0].lon}`);
                    break;
                } else {
                    console.log(`❌ No match for query "${q}"`);
                }
            }
        }

        const users = await User.find({ role: 'user', "addresses.0": { $exists: true } }).limit(5);
        console.log(`\n--- Checking Sample Users (${users.length}) ---`);
        for (const user of users) {
            for (const addr of user.addresses) {
                const fullAddr = addr.address || `${addr.house}, ${addr.area}, ${addr.city}`;
                console.log(`\nUser Address: ${fullAddr}`);
                console.log(`Stored Lat/Lon: ${addr.lat}, ${addr.lon}`);

                const queries = [fullAddr, fullAddr.split(",").slice(-2).join(","), fullAddr.split(",").pop()].filter(Boolean);
                for (const q of queries) {
                    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
                        headers: { 'User-Agent': 'KhammaGhani-Diagnostic' }
                    });
                    const data = await resp.json();
                    if (data && data.length > 0) {
                        console.log(`✅ Found match for user query "${q}": ${data[0].lat}, ${data[0].lon}`);
                        break;
                    } else {
                        console.log(`❌ No match for user query "${q}"`);
                    }
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Diagnostic Error:", err);
        process.exit(1);
    }
}

checkGeocoding();
