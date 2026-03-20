import mongoose from "mongoose";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Curated high-quality Rajasthani Heritage/Restaurant Interior images (Unsplash IDs)
const rajasthaniImages = [
    "https://images.unsplash.com/photo-1595844730298-b960ff98fee0?w=800&q=80", // ThfqouCM2EI - Heritage room
    "https://images.unsplash.com/photo-1590481879031-625447195484?w=800&q=80", // Heritage entrance
    "https://images.unsplash.com/photo-1590050752117-23dc5f164cc8?w=800&q=80", // Arched doorways
    "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800&q=80", // Traditional dining hall
    "https://images.unsplash.com/photo-1602339587891-6c703b0d2d88?w=800&q=80", // Interior Palace
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80", // Scenic restaurant view
    "https://images.unsplash.com/photo-1596701062351-ef1299c36053?w=800&q=80", // Royal seating
    "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80", // Rooftop heritage
    "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&q=80"  // Haveli dining
];
// Note: I already had some good ones, I'll mix them with the ones from the subagent
// The subagent provided some IDs, I'll convert them to the expected URL format.
const updatedImages = [
    "https://images.unsplash.com/photo-1595844730298-b960ff98fee0?w=800&q=80", // ThfqouCM2EI
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80", // ksG_tf2pbpo
    "https://images.unsplash.com/photo-1590481879031-625447195484?w=800&q=80", // 4202_okVnQY
    "https://images.unsplash.com/photo-1590050752117-23dc5f164cc8?w=800&q=80", // -Igw6VtB-WY
    "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800&q=80", // 5Oi8FTUllA0
    "https://images.unsplash.com/photo-1602339587891-6c703b0d2d88?w=800&q=80", // kodV0c8sxpQ
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80", // S055Sly_9T0
    "https://images.unsplash.com/photo-1596701062351-ef1299c36053?w=800&q=80"  // p-SliS6T3mQ
];

const seedRestaurantImages = async () => {
    try {
        await connectDB();

        const restaurants = await User.find({ role: "restaurant" });
        if (restaurants.length === 0) {
            console.log("❌ No restaurants found.");
            process.exit();
        }

        console.log(`Found ${restaurants.length} restaurants. Seeding 3 Rajasthani style images per restaurant...`);

        for (const res of restaurants) {
            // Shuffle and pick 3 unique images from the pool
            const selectedImages = [...updatedImages]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map((img, index) => `${img}&sig=${res._id}-${index}`);

            res.restaurantImages = selectedImages;
            await res.save();
            console.log(`✅ 3 images seeded for restaurant: ${res.name}`);
        }

        console.log("\n🎉 Restaurant image seeding complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedRestaurantImages();
