import User from "../Models/user.js";

/* =========================
   GET ALL RESTAURANTS
========================= */
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find(
      { role: "restaurant" },
      {
        password: 0,          // hide password
        __v: 0,
      }
    ).sort({ name: 1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
