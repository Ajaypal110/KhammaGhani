import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import restaurantAuthRoutes from "./routes/restaurantAuthRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantDashboardRoutes from "./routes/restaurantDashboardRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/restaurant/auth", restaurantAuthRoutes);
app.use("/api", searchRoutes);

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant", restaurantDashboardRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Khamagani API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
