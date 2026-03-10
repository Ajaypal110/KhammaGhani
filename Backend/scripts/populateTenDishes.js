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

// 150 unique dishes (10 per restaurant * 15 restaurants)
const dishPool = [
    // STARTERS
    { name: "Crispy Honey Chili Lotus Root", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=1" },
    { name: "Stuffed Zucchini Flowers", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626509135520-798d4008709f?w=800&q=80&sig=2" },
    { name: "Beetroot & Mozzarella Arancini", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1626132646529-50308d6be62b?w=800&q=80&sig=3" },
    { name: "Spicy Edamame with Sea Salt", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1599307734177-340e4544866d?w=800&q=80&sig=4" },
    { name: "Truffle Oil Infused Mushrooms", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&sig=5" },
    { name: "Avocado Bruschetta", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80&sig=6" },
    { name: "Goat Cheese Crostini", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80&sig=7" },
    { name: "Spinach & Artichoke Dip", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80&sig=8" },
    { name: "Pan-Seared Scallops", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80&sig=9" },
    { name: "Soft Shell Crab Tempura", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80&sig=10" },
    { name: "Wagyu Beef Carpaccio", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&sig=11" },
    { name: "Duck Confit Spring Rolls", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&sig=12" },
    { name: "Tuna Tartare with Avocado", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80&sig=13" },
    { name: "Lamb Seekh Flatbread", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80&sig=14" },
    { name: "Gambas al Ajillo", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80&sig=15" },
    { name: "Lemon Garlic Calamari", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&sig=16" },
    { name: "Miso Glazed Pork Belly", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800&q=80&sig=17" },
    { name: "Buffalo Chicken Sliders", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1563223552-30d01fda3ead?w=800&q=80&sig=18" },
    { name: "Salmon Roe Canapés", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80&sig=19" },
    { name: "Chili Garlic Prawns", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?w=800&q=80&sig=20" },

    // MAIN COURSE
    { name: "Wild Mushroom Risotto", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80&sig=21" },
    { name: "Eggplant Parmigiana", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=800&q=80&sig=22" },
    { name: "Roasted Root Vegetable Medley", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=23" },
    { name: "Spinach & Ricotta Ravioli", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80&sig=24" },
    { name: "Thai Green Curry (Veg)", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=25" },
    { name: "Paneer Pasanda", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80&sig=26" },
    { name: "Vegetable Pot Pie", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=27" },
    { name: "Quinoa & Black Bean Buddha Bowl", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&sig=28" },
    { name: "Butternut Squash Gnocchi", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&sig=29" },
    { name: "Cauliflower Steak with Chimichurri", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&sig=30" },
    { name: "Portobello Mushroom Burger", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1606342377395-5d46e27945d8?w=800&q=80&sig=31" },
    { name: "Vegetable Lasagne Verde", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1619895092538-1283acc17890?w=800&q=80&sig=32" },
    { name: "Paneer Methi Malai", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&sig=33" },
    { name: "Ratatouille Provencal", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=800&q=80&sig=34" },
    { name: "Tofu & Broccoli Stir-Fry", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?w=800&q=80&sig=35" },
    { name: "Braised Short Ribs", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&sig=36" },
    { name: "Grilled Seabass with Asparagus", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80&sig=37" },
    { name: "Herb-Crusted Rack of Lamb", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80&sig=38" },
    { name: "Chicken Cordon Bleu", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&sig=39" },
    { name: "Duck L'Orange", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&sig=40" },
    { name: "Lobster Thermidor", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1559742811-822873d4a6c4?w=800&q=80&sig=41" },
    { name: "Filet Mignon with Red Wine Jus", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80&sig=42" },
    { name: "Chicken Tikka Makhani", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603894584115-f73f2ec851ad?w=800&q=80&sig=43" },
    { name: "Mutton Biryani Royal", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80&sig=44" },
    { name: "Pan-Seared Duck Breast", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&sig=45" },
    { name: "Teriyaki Glazed Salmon", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&sig=46" },
    { name: "Beef Stroganoff", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&q=80&sig=47" },
    { name: "Chicken Marsala", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=800&q=80&sig=48" },
    { name: "Mutton Rogan Josh Special", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?w=800&q=80&sig=49" },
    { name: "Garlic Butter Scampi", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80&sig=50" },

    // BREADS & SIDES
    { name: "Truffle Naan", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&sig=51" },
    { name: "Cheese & Garlic Kulcha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=52" },
    { name: "Rosemary Focaccia", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?w=800&q=80&sig=53" },
    { name: "Olive & Herb Breadsticks", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=54" },
    { name: "Garlic Confit Bread", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=55" },
    { name: "Peshawari Naan (Sweet)", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&sig=56" },
    { name: "Layered Lachha Paratha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=57" },
    { name: "Stuffed Onion Kulcha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=58" },
    { name: "Butter Garlic Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?w=800&q=80&sig=59" },
    { name: "Missi Roti Deluxe", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=60" },
    { name: "Tandoori Whole Wheat Roti", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1533777324545-e0169353229b?w=800&q=80&sig=61" },
    { name: "Amritsari Aloo Kulcha", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=62" },
    { name: "Pesto Pizza Bread", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=800&q=80&sig=63" },
    { name: "Sourdough Garlic Bread", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=64" },
    { name: "Mini Naan Bites", category: "Breads", isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&sig=65" },

    // BEVERAGES
    { name: "Berry Blast Smoothie", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80&sig=66" },
    { name: "Classic Mint Mojito", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&sig=67" },
    { name: "Iced Caramel Macchiato", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80&sig=68" },
    { name: "Mango & Coconut Lassi", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1563223552-30d01fda3ead?w=800&q=80&sig=69" },
    { name: "Sparkling Lavender Lemonade", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&sig=70" },
    { name: "Dark Chocolate Hazelnut Shake", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&sig=71" },
    { name: "Matcha Green Tea Latte", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1544787210-22db36477283?w=800&q=80&sig=72" },
    { name: "Peach Iced Tea with Mint", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800&q=80&sig=73" },
    { name: "Classic Cold Brew Coffee", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80&sig=74" },
    { name: "Fresh Watermelon Cooler", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&sig=75" },
    { name: "Passion Fruit Martini (Mocktail)", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&sig=76" },
    { name: "Pineapple Coconut Frappé", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&sig=77" },
    { name: "Turmeric Ginger Latte", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1544787210-22db36477283?w=800&q=80&sig=78" },
    { name: "Blueberry Cheesecake Shake", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80&sig=79" },
    { name: "Earl Grey Iced Coffee", category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80&sig=80" },

    // DESSERTS
    { name: "Dark Chocolate Lava Cake", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&sig=81" },
    { name: "Classic New York Cheesecake", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80&sig=82" },
    { name: "Tiramisu with Mascarpone", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80&sig=83" },
    { name: "Warm Apple Pie with Ice Cream", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&q=80&sig=84" },
    { name: "Raspberry Macaron Tower", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800&q=80&sig=85" },
    { name: "Crème Brûlée with Berries", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1516685018646-527ad952f8d4?w=800&q=80&sig=86" },
    { name: "Mango Sticky Rice", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80&sig=87" },
    { name: "Gulab Jamun with Rabri", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80&sig=88" },
    { name: "Saffron Pistachio Kulfi", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800&q=80&sig=89" },
    { name: "Chocolate Hazelnut Mousse", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&sig=90" },
    { name: "Blueberry Glazed Donut", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80&sig=91" },
    { name: "Red Velvet Pastry Deluxe", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80&sig=92" },
    { name: "Sticky Toffee Pudding", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&sig=93" },
    { name: "Banoffee Pie Cup", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80&sig=94" },
    { name: "Baklava with Honey", category: "Desserts", isVeg: true, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80&sig=95" },

    // ADDITIONAL STARTERS (to reach 150)
    { name: "Honey Chili Cauliflower Bites", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=800&q=80&sig=96" },
    { name: "Sweet Potato Fries with Aioli", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80&sig=97" },
    { name: "Crispy Fried Ravioli", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80&sig=98" },
    { name: "Za'atar Roasted Carrots", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=99" },
    { name: "Cheesy Stuffed Jalapeños", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80&sig=100" },
    { name: "Korean Fried Chicken Wings", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80&sig=101" },
    { name: "Pulled Pork Sliders", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800&q=80&sig=102" },
    { name: "Crispy Pork Gyoza", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80&sig=103" },
    { name: "Beef Empanadas", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&sig=104" },
    { name: "Chicken Satay with Peanut Sauce", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?w=800&q=80&sig=105" },

    // ADDITIONAL MAIN COURSE
    { name: "Creamy Pesto Pasta", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1645112481338-356fd8016464?w=800&q=80&sig=106" },
    { name: "Roasted Pumpkin Soup", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=107" },
    { name: "Veggie Paella", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=108" },
    { name: "Stuffed Bell Peppers", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80&sig=109" },
    { name: "Vegetable Biryani Royale", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&sig=110" },
    { name: "Lamb Tagine with Prunes", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?w=800&q=80&sig=111" },
    { name: "Crispy Skin Salmon", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80&sig=112" },
    { name: "Braised Lamb Shanks", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80&sig=113" },
    { name: "Seafood Linguine", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80&sig=114" },
    { name: "Duck Breast with Cherry Sauce", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&sig=115" },

    // CHINESE
    { name: "Schezwan Chicken Deluxe", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1598514522432-84959db14d2a?w=800&q=80&sig=116" },
    { name: "Veg Hakka Noodles Special", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&sig=117" },
    { name: "Dim Sum Basket (Mixed)", category: "Chinese", isVeg: true, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80&sig=118" },
    { name: "Kung Pao Shrimp", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&sig=119" },
    { name: "Sweet & Sour Pork", category: "Chinese", isVeg: false, image: "https://images.unsplash.com/photo-1598514522432-84959db14d2a?w=800&q=80&sig=120" },

    // ITALIAN
    { name: "Margherita Pizza Primo", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80&sig=121" },
    { name: "Pepperoni Passion Pizza", category: "Italian", isVeg: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&sig=122" },
    { name: "Spaghetti Carbonara Authentic", category: "Italian", isVeg: false, image: "https://images.unsplash.com/photo-1645112481338-356fd8016464?w=800&q=80&sig=123" },
    { name: "Aglio e Olio Pasta", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1645112481338-356fd8016464?w=800&q=80&sig=124" },
    { name: "Garden Fresh Calzone", category: "Italian", isVeg: true, image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&q=80&sig=125" },

    // RAJASTHANI
    { name: "Authentic Dal Bati", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&sig=126" },
    { name: "Heritage Lal Maas", category: "Rajasthani", isVeg: false, image: "https://images.unsplash.com/photo-1542362567-b0d4cc7bbad4?w=800&q=80&sig=127" },
    { name: "Gatta Curry Special", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&sig=128" },
    { name: "Ker Sangri Deluxe", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&sig=129" },
    { name: "Rajasthani Kadhi Pakoda", category: "Rajasthani", isVeg: true, image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80&sig=130" },

    // MIXED BAG
    { name: "French Onion Soup", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=131" },
    { name: "Chicken Fajitas", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&sig=132" },
    { name: "Beef Stroganoff Classic", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&q=80&sig=133" },
    { name: "Veggie Thai Red Curry", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&sig=134" },
    { name: "Moussaka Greco", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&sig=135" },
    { name: "Pad Thai Shrimp", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80&sig=136" },
    { name: "Classic Beef Burger", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&sig=137" },
    { name: "Grilled Halloumi Salad", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=138" },
    { name: "Lamb Kofta Skewers", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80&sig=139" },
    { name: "Shrimp Cocktail", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1512058560550-42749559777f?w=800&q=80&sig=140" },
    { name: "Lentil Soup Hearty", category: "Main Course", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&sig=141" },
    { name: "Chicken Schnitzel", category: "Main Course", isVeg: false, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&sig=142" },
    { name: "Aloo Tikki Chaat", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=143" },
    { name: "Dahi Bhalla Puri", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=144" },
    { name: "Samosa Plate", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=145" },
    { name: "Paneer Tikka Roll", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80&sig=146" },
    { name: "Chicken Malai Tikka", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&sig=147" },
    { name: "Vegetable Pakora", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?w=800&q=80&sig=148" },
    { name: "Chicken Manchurian Dry", category: "Starters", isVeg: false, image: "https://images.unsplash.com/photo-1626509135520-798d4008709f?w=800&q=80&sig=149" },
    { name: "Crispy Baby Corn", category: "Starters", isVeg: true, image: "https://images.unsplash.com/photo-1599307734177-340e4544866d?w=800&q=80&sig=150" }
];

const generateVariations = (price, category) => {
    const applicableCategories = ["Main Course", "Starters", "Chinese", "Rajasthani"];
    if (applicableCategories.includes(category)) {
        return [
            { name: "Half", price: Math.round(price * 0.6) },
            { name: "Full", price: price }
        ];
    }
    if (category === "Italian") {
        return [
            { name: "Small", price: Math.round(price * 0.8) },
            { name: "Medium", price: price },
            { name: "Large", price: Math.round(price * 1.3) }
        ];
    }
    if (category === "Beverages") {
        return [
            { name: "Regular", price: price },
            { name: "Large", price: Math.round(price * 1.4) }
        ];
    }
    return [];
};

const seedMenus = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing existing menu items...");
        await Menu.deleteMany({});
        console.log("✅ Menu collection cleared.");

        const restaurants = await User.find({ role: "restaurant" });
        if (restaurants.length === 0) {
            console.log("❌ No restaurants found.");
            process.exit();
        }

        console.log(`Found ${restaurants.length} restaurants. Seeding 10 unique dishes per restaurant...`);

        // Shuffle the global dish pool once to ensure random distribution
        const shuffledPool = [...dishPool].sort(() => 0.5 - Math.random());

        let dishIndex = 0;

        for (const res of restaurants) {
            console.log(`\nGenerating 10 unique dishes for: ${res.name}...`);

            // Pick 10 dishes from the pool for this restaurant
            const selectedDishes = shuffledPool.slice(dishIndex, dishIndex + 10);
            dishIndex += 10;

            if (selectedDishes.length < 10) {
                console.log(`⚠️ Not enough dishes left for ${res.name}. Only ${selectedDishes.length} assigned.`);
            }

            const menuItems = selectedDishes.map((dish) => {
                const basePrice = Math.floor(Math.random() * (450 - 150 + 1)) + 150;

                return {
                    name: dish.name,
                    category: dish.category,
                    description: `Signature ${dish.name} made with premium ingredients. A must-try at ${res.name}!`,
                    price: basePrice,
                    variations: generateVariations(basePrice, dish.category),
                    image: dish.image,
                    restaurant: res._id,
                    inStock: true,
                    isVeg: dish.isVeg,
                    dietaryType: dish.isVeg ? "Veg" : "Non-Veg",
                    preparationTime: Math.floor(Math.random() * 25) + 15,
                };
            });

            await Menu.insertMany(menuItems);
            console.log(`✅ 10 unique dishes seeded for ${res.name}`);
        }

        const finalCount = await Menu.countDocuments();
        console.log(`\n🎉 Database re-seeded! Total menu items: ${finalCount}`);

        const uniqueImages = await Menu.distinct("image");
        console.log(`Unique images count: ${uniqueImages.length}`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedMenus();
