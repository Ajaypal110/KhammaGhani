import mongoose from "mongoose";
import Menu from "../Models/Menu.js";
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

const dishPool = [
    { name: "Crispy Honey Chili Lotus Root", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
    { name: "Avocado Bruschetta", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80" },
    { name: "Chili Garlic Prawns", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?w=800&q=80" },
    { name: "Wild Mushroom Risotto", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80" },
    { name: "Paneer Tikka Makhani", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?w=800&q=80" },
    { name: "Grilled Seabass with Asparagus", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" },
    { name: "Heritage Lal Maas", category: "Rajasthani", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?w=800&q=80" },
    { name: "Authentic Dal Bati", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
    { name: "Dark Chocolate Lava Cake", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80" },
    { name: "Classic New York Cheesecake", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80" },
    { name: "Mango Sticky Rice", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80" },
    { name: "Berry Blast Smoothie", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80" },
    { name: "Classic Mint Mojito", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
    { name: "Truffle Naan", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80" },
    { name: "Pepperoni Passion Pizza", category: "Italian", isVeg: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
    { name: "Margherita Pizza Primo", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80" },
    { name: "Veg Hakka Noodles Special", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
    { name: "Schezwan Chicken Deluxe", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1598514522432-84959db14d2a?w=800&q=80" },
    { name: "Gatta Curry Special", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80" },
    { name: "Tandoori Chicken Platter", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
    { name: "Butter Chicken Classic", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?w=800&q=80" },
    { name: "Dal Makhani Heritage", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
    { name: "Paneer Lababdar", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?w=800&q=80" },
    { name: "Lamb Rogan Josh", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?w=800&q=80" },
    { name: "Fish and Chips", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" },
    { name: "Veg Burger Supreme", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { name: "Chicken Tikka Kebab", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80" },
    { name: "Spring Rolls (Veg)", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80" },
    { name: "Garlic Bread with Cheese", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=800&q=80" },
    { name: "Masala Dosa", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80" }
];

const seedFiveDishes = async () => {
    try {
        await connectDB();

        // Clear existing menu items before seeding
        console.log("🧹 Clearing all existing menu items from the database...");
        const deleteResult = await Menu.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} items.`);
        
        const restaurants = await User.find({ role: "restaurant" });
        if (restaurants.length === 0) {
            console.log("❌ No restaurants found.");
            process.exit();
        }

        console.log(`Found ${restaurants.length} restaurants. Seeding 5 unique dishes per restaurant...`);

        for (const res of restaurants) {
            console.log(`\nGenerating 5 unique dishes for: ${res.name}...`);

            // Shuffle the dish pool for this restaurant to get 5 random dishes
            const shuffledPool = [...dishPool].sort(() => 0.5 - Math.random());
            const selectedDishes = shuffledPool.slice(0, 5);

            const menuItems = selectedDishes.map((dish, index) => {
                const basePrice = Math.floor(Math.random() * (450 - 150 + 1)) + 150;

                return {
                    name: dish.name,
                    category: dish.category,
                    description: `Signature ${dish.name} made with premium ingredients. A must-try at ${res.name}!`,
                    price: basePrice,
                    // Use unique signature to ensure different images for each dish
                    image: `${dish.image}&sig=${res._id}-${index}`,
                    restaurant: res._id,
                    inStock: true,
                    isVeg: dish.isVeg,
                    dietaryType: dish.isVeg ? "Veg" : "Non-Veg",
                    preparationTime: Math.floor(Math.random() * 25) + 15,
                };
            });

            await Menu.insertMany(menuItems);
            console.log(`✅ 5 unique dishes seeded for ${res.name}`);
        }

        const finalCount = await Menu.countDocuments();
        console.log(`\n🎉 Seeding complete! Total menu items now: ${finalCount}`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedFiveDishes();
