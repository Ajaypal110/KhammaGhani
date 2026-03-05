import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

const restaurants = [
  {
    name: "Khammaghani Jaipur",
    email: "jaipur@khammaghani.com",
    password: "Khamma@Jaipur123",
    restaurantId: "JAIPUR_01",
  },
  {
    name: "Khammaghani Delhi",
    email: "delhi@khammaghani.com",
    password: "Khamma@Delhi123",
    restaurantId: "DELHI_01",
  },
  {
    name: "Khammaghani Mumbai",
    email: "mumbai@khammaghani.com",
    password: "Khamma@Mumbai123",
    restaurantId: "MUMBAI_01",
  },
  {
    name: "Khammaghani Udaipur",
    email: "Udaipur@khammaghani.com",
    password: "Khamma@udaipur123",
    restaurantId: "UDAIPUR_01",
  },
  {
    name: "Khammaghani Jodhpur",
    email: "jodhpur@khammaghani.com",
    password: "Khamma@jodhpur123",
    restaurantId: "JODHPUR_01",
  },
  {
    name: "Khammaghani Goa",
    email: "goa@khammaghani.com",
    password: "Khamma@goa123",
    restaurantId: "GOA_01",
  }, {
    name: "Khammaghani Banglore",
    email: "banglore@khammaghani.com",
    password: "Khamma@banglore123",
    restaurantId: "BANGLORE_01",
  },
  {
    name: "Khammaghani Pune",
    email: "pune@khammaghani.com",
    password: "Khamma@pune123",
    restaurantId: "PUNE_01",
  },
  {
    name: "Khammaghani Noida",
    email: "noida@khammaghani.com",
    password: "Khamma@Noida123",
    restaurantId: "NOIDA_01",
  }, {
    name: "Khammaghani Hyderabad",
    email: "hyedrabad@khammaghani.com",
    password: "Khamma@Hyedrabad123",
    restaurantId: "HYDERABAD_01",
  },
  {
    name: "Khammaghani Surat",
    email: "surat@khammaghani.com",
    password: "Khamma@SUrat123",
    restaurantId: "SURAT_01",
  },
  {
    name: "Khammaghani Kashmir",
    email: "kashmir@khammaghani.com",
    password: "Khamma@Kashmir123",
    restaurantId: "KASHMIR_01",
  }, {
    name: "Khammaghani Sikkim",
    email: "sikkim@khammaghani.com",
    password: "Khamma@Sikkim123",
    restaurantId: "SIKKIM_01",
  },
  {
    name: "Khammaghani Darjling",
    email: "darjling@khammaghani.com",
    password: "Khamma@Darjling123",
    restaurantId: "DARJLING_01",
  },
  {
    name: "Khammaghani Bhopal",
    email: "bhopal@khammaghani.com",
    password: "Khamma@Bhopal123",
    restaurantId: "BHOPAL_01",
  },
];

const seedRestaurants = async () => {
  try {
    await connectDB();

    for (const r of restaurants) {
      const exists = await User.findOne({ email: r.email });
      if (exists) {
        console.log(`❌ Already exists: ${r.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(r.password, 10);

      await User.create({
        name: r.name,
        email: r.email,
        password: hashedPassword,
        role: "restaurant",
        restaurantId: r.restaurantId,
        isEmailVerified: true,
      });

      console.log(`✅ Created: ${r.email}`);
    }

    console.log("🎉 All restaurants processed");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRestaurants();
