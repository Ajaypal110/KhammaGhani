// controllers/searchController.js
import Menu from "../Models/Menu.js";
import Restaurant from "../Models/Restaurant.js";

export const searchDish = async (req, res) => {
  try {
    const { q, lat, lng } = req.query;

    const dishes = await Menu.find({
      name: { $regex: q, $options: "i" },
    });

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      { $limit: 5 },
    ]);

    res.json({ dishes, restaurants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
