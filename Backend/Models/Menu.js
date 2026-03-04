import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: false },
    category: { type: String, required: true },
    contents: String, // ex: 4 rotis, sabzi
    description: String,
    image: String,
    isVeg: { type: Boolean, default: true },
    dietaryType: { type: String, enum: ["Veg", "Non-Veg", "Egg"], default: "Veg" },
    discountPrice: Number,
    isGstIncluded: { type: Boolean, default: false },
    spiceLevel: { type: String, enum: ["Low", "Medium", "High", "None"], default: "None" },
    inStock: { type: Boolean, default: true },
    preparationTime: Number, // in minutes
    availableDays: [String],
    availableTime: {
      start: String,
      end: String,
    },
    tags: [String], // Bestseller, Recommended, Chef Special, New
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    variations: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Menu ||
  mongoose.model("Menu", menuSchema);
