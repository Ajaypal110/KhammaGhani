import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  role: String,
  city: String,
  address: String,
  lat: Number,
  lon: Number
}, { strict: false }));

const cityData = {
  "udaipur": {
    city: "Udaipur",
    address: "Fateh Sagar Lake, Udaipur, Rajasthan, India",
    lat: 24.5936,
    lon: 73.6791
  },
  "hyderabad": {
    city: "Hyderabad",
    address: "Charminar, Hyderabad, Telangana, India",
    lat: 17.3616,
    lon: 78.4747
  },
  "delhi": {
    city: "Delhi",
    address: "India Gate, New Delhi, Delhi, India",
    lat: 28.6129,
    lon: 77.2295
  },
  "mumbai": {
    city: "Mumbai",
    address: "Gateway of India, Mumbai, Maharashtra, India",
    lat: 18.9220,
    lon: 72.8347
  },
  "bangalore": {
    city: "Bangalore",
    address: "Lalbagh Botanical Garden, Bangalore, Karnataka, India",
    lat: 12.9507,
    lon: 77.5844
  },
  "jaipur": {
    city: "Jaipur",
    address: "Hawa Mahal, Jaipur, Rajasthan, India",
    lat: 26.9239,
    lon: 75.8267
  }
};

const seedLocations = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    const restaurants = await User.find({ role: "restaurant" });
    console.log(`Found ${restaurants.length} restaurants.`);

    for (const res of restaurants) {
      const nameLower = res.name.toLowerCase();
      let matchedCity = "udaipur"; // default

      // Try searching city in name
      for (const cityKey of Object.keys(cityData)) {
        if (nameLower.includes(cityKey)) {
          matchedCity = cityKey;
          break;
        }
      }

      const data = cityData[matchedCity];
      console.log(`Updating ${res.name} -> City: ${data.city}`);

      await User.findByIdAndUpdate(res._id, {
        city: data.city,
        address: data.address,
        lat: data.lat,
        lon: data.lon
      });
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding locations:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedLocations();
