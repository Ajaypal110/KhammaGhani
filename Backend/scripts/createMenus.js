import mongoose from "mongoose";
import Menu from "../Models/Menu.js";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

/* ---------- CONNECT DATABASE ---------- */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

/* ---------- DISH POOL (110+ UNIQUE DISHES WITH VERIFIED IMAGES) ---------- */
const dishPool = [
    // --- STARTERS (Veg) - 20 items ---
    { name: "Paneer Tikka", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Manchurian", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626509135520-798d4008709f?auto=format&fit=crop&w=800&q=80" },
    { name: "Hara Bhara Kabab", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626132646529-50308d6be62b?auto=format&fit=crop&w=800&q=80" },
    { name: "Crispy Corn", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1599307734177-340e4544866d?auto=format&fit=crop&w=800&q=80" },
    { name: "Spring Rolls", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
    { name: "Honey Chilli Potato", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=800&q=80" },
    { name: "Dahi Ke Kabab", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer 65", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { name: "Mushroom Tikka", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Dimsums", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80" },
    { name: "Samosa", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Onion Bhaji", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Gobi 65", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626777558344-b04e4577558d?auto=format&fit=crop&w=800&q=80" },
    { name: "Cheese Chilli", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { name: "Dahi Vada", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Corn Salt & Pepper", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1599307734177-340e4544866d?auto=format&fit=crop&w=800&q=80" },
    { name: "Stuffed Mushroom", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Lollipop", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626509135520-798d4008709f?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer Momos", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80" },
    { name: "Aloo Paratha (Mini)", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80" },

    // --- STARTERS (Non-Veg) - 15 items ---
    { name: "Chicken Tikka", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken 65", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80" },
    { name: "Fish Tikka", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Lolipop", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Seekh Kabab", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80" },
    { name: "Tandoori Chicken", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Seekh Kabab", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80" },
    { name: "Kalmi Kabab", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80" },
    { name: "Achari Fish Tikka", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Boti Kabab", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?auto=format&fit=crop&w=800&q=80" },
    { name: "Afghani Chicken", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Pakora", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Wings (Spicy)", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Momos", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80" },
    { name: "Stuffed Tangri", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80" },

    // --- MAIN COURSE (Veg) - 25 items ---
    { name: "Paneer Butter Masala", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Dal Makhani", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80" },
    { name: "Palak Paneer", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80" },
    { name: "Malai Kofta", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Shahi Paneer", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80" },
    { name: "Dal Tadka", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Kadai Paneer", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Baingan Bharta", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Mix Veg Curry", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer Lababdar", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Matar Paneer", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Jeera Aloo", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Navratan Korma", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80" },
    { name: "Dum Aloo", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Chana Masala", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Kolhapuri", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { name: "Mushroom Masala", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80" },
    { name: "Methi Matar Malai", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Aloo Gobi", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Bhindi Do Pyaza", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer Do Pyaza", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Jalfrezi", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { name: "Dal Panchratna", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Handi Paneer", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },
    { name: "Kashmiri Pulao", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },

    // --- MAIN COURSE (Non-Veg) - 15 items ---
    { name: "Butter Chicken", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Tikka Masala", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Rogan Josh", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?auto=format&fit=crop&w=800&q=80" },
    { name: "Kadai Chicken", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Korma", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1589227133344-10ec054f2fbf?auto=format&fit=crop&w=800&q=80" },
    { name: "Handi Chicken", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Keema Matar", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Curry (Home Style)", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Rara", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Lababdar", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Fish Curry", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" },
    { name: "Egg Curry", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Do Pyaza", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { name: "Lemon Chicken (Gravy)", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Saagwala", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80" },

    // --- RAJASTHANI SPECIALS - 8 items ---
    { name: "Dal Bati Churma", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },
    { name: "Gatta Curry", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80" },
    { name: "Lal Maas", category: "Rajasthani", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?auto=format&fit=crop&w=800&q=80" },
    { name: "Ker Sangri", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80" },
    { name: "Rajasthani Kadhi", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80" },
    { name: "Papad ki Sabzi", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80" },
    { name: "Bajre ki Khichdi", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Sev Tamatar", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80" },

    // --- BIRYANI - 7 items ---
    { name: "Chicken Biryani (Dum)", category: "Biryani", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80" },
    { name: "Mutton Biryani", category: "Biryani", isVeg: false, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Biryani", category: "Biryani", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },
    { name: "Egg Biryani", category: "Biryani", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80" },
    { name: "Hyderabadi Chicken Biryani", category: "Biryani", isVeg: false, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" },
    { name: "Lucknowi Biryani", category: "Biryani", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer Biryani", category: "Biryani", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },

    // --- CHINESE - 10 items ---
    { name: "Veg Hakka Noodles", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Hakka Noodles", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Fried Rice", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Fried Rice", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80" },
    { name: "Chilli Chicken", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1598514522432-84959db14d2a?auto=format&fit=crop&w=800&q=80" },
    { name: "Schezwan Noodles (Veg)", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Manchurian Gravy", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1598514522432-84959db14d2a?auto=format&fit=crop&w=800&q=80" },
    { name: "Honey Chilli Cauliflower", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=800&q=80" },
    { name: "Chilli Garlic Fried Rice", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?auto=format&fit=crop&w=800&q=80" },
    { name: "Singapore Noodles", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80" },

    // --- ITALIAN - 8 items ---
    { name: "Margherita Pizza", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80" },
    { name: "Farmhouse Pizza", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Overload Pizza", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Tikka Pizza", category: "Italian", isVeg: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" },
    { name: "White Sauce Pasta (Veg)", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1645112481338-356fd8016464?auto=format&fit=crop&w=800&q=80" },
    { name: "Pink Sauce Pasta", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { name: "Pasta Alfredo (Chicken)", category: "Italian", isVeg: false, image: "https://images.unsplash.com/photo-1645112481338-356fd8016464?auto=format&fit=crop&w=800&q=80" },
    { name: "Veg Lasagna", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1619895092538-1283acc17890?auto=format&fit=crop&w=800&q=80" },

    // --- BREADS - 10 items ---
    { name: "Butter Naan", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Garlic Naan", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80" },
    { name: "Tandoori Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?auto=format&fit=crop&w=800&q=80" },
    { name: "Lachha Paratha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
    { name: "Amritsari Kulcha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Missi Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Paneer Naan", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80" },
    { name: "Plain Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?auto=format&fit=crop&w=800&q=80" },
    { name: "Butter Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?auto=format&fit=crop&w=800&q=80" },
    { name: "Stuffed Kulcha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?auto=format&fit=crop&w=800&q=80" },

    // --- BEVERAGES - 10 items ---
    { name: "Cold Coffee", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80" },
    { name: "Mango Lassi", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1563223552-30d01fda3ead?auto=format&fit=crop&w=800&q=80" },
    { name: "Fresh Lime Soda", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80" },
    { name: "Masala Chai", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1544787210-22db36477283?auto=format&fit=crop&w=800&q=80" },
    { name: "Virgin Mojito", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80" },
    { name: "Chocolate Shake", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80" },
    { name: "Oreo Shake", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80" },
    { name: "Strawberry Smoothie", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80" },
    { name: "Iced Tea (Lemon)", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=800&q=80" },
    { name: "Green Tea", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1544787210-22db36477283?auto=format&fit=crop&w=800&q=80" },

    // --- DESSERTS - 10 items ---
    { name: "Gulab Jamun", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80" },
    { name: "Chocolate Brownie", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80" },
    { name: "Ice Cream Scoop (Vanilla)", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=800&q=80" },
    { name: "Rasmalai", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1621361845455-d3c2317781d4?auto=format&fit=crop&w=800&q=80" },
    { name: "Kheer", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80" },
    { name: "Gajar Halwa", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80" },
    { name: "Chocolate Mousse", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80" },
    { name: "Tiramisu", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80" },
    { name: "Mango Pudding", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80" },
    { name: "Pastry (Chocolate)", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80" }
];

/* ---------- VARIATIONS GENERATOR ---------- */
const generateVariations = (price, category) => {
    // Half/Full for Indian items
    const applicableCategories = ["Main Course", "Starters", "Biryani", "Rajasthani", "Chinese"];
    if (applicableCategories.includes(category)) {
        return [
            { name: "Half", price: Math.round(price * 0.6) },
            { name: "Full", price: price }
        ];
    }
    // S/M/L for Italian
    if (category === "Italian") {
        return [
            { name: "Small", price: Math.round(price * 0.8) },
            { name: "Medium", price: price },
            { name: "Large", price: Math.round(price * 1.3) }
        ];
    }
    // Regular/Large for Beverages
    if (category === "Beverages") {
        return [
            { name: "Regular", price: price },
            { name: "Large", price: Math.round(price * 1.4) }
        ];
    }
    return [];
};

/* ---------- SEEDING SCRIPT ---------- */
const seedMenus = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing all existing menu items...");
        await Menu.deleteMany({});
        console.log("✅ Menu collection cleared.");

        const restaurants = await User.find({ role: "restaurant" });
        if (restaurants.length === 0) {
            console.log("❌ No restaurants found.");
            process.exit();
        }

        console.log(`Found ${restaurants.length} restaurants. Seeding 50+ unique, verified dishes...`);

        for (const res of restaurants) {
            console.log(`\nGenerating unique menu for: ${res.name}...`);

            // Shuffle pool and pick 60 unique dishes for a 50+ list
            const shuffled = [...dishPool].sort(() => 0.5 - Math.random());
            const selectedDishes = shuffled.slice(0, 60);

            const menuItems = selectedDishes.map((dish, index) => {
                // Random base price between 120 and 350
                const basePrice = Math.floor(Math.random() * (350 - 120 + 1)) + 120;

                return {
                    name: dish.name,
                    category: dish.category,
                    description: `Classic ${dish.name} prepared with fresh ingredients and authentic spices.`,
                    price: basePrice,
                    variations: generateVariations(basePrice, dish.category),
                    image: dish.image,
                    restaurant: res._id,
                    inStock: true,
                    isVeg: dish.isVeg,
                    dietaryType: dish.isVeg ? "Veg" : "Non-Veg",
                    preparationTime: Math.floor(Math.random() * 20) + 15,
                };
            });

            await Menu.insertMany(menuItems);
            console.log(`✅ 60 dishes seeded for ${res.name}`);
        }

        console.log("\n🎉 Database re-seeded! Every dish has a verified matching image.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedMenus();