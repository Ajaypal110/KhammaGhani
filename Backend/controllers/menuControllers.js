import Menu from "../Models/Menu.js";

export const addMenuItem = async (req, res) => {
  const { name, price, image, description } = req.body;

  const menu = await Menu.create({
    name,
    price,
    image,
    description,
    restaurant: req.user._id,
  });

  res.json(menu);
};

export const updateMenuItem = async (req, res) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu)
    return res.status(404).json({ message: "Not found" });

  if (menu.restaurant.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Not authorized" });

  menu.name = req.body.name || menu.name;
  menu.price = req.body.price || menu.price;
  menu.image = req.body.image || menu.image;
  menu.description = req.body.description || menu.description;

  await menu.save();
  res.json(menu);
};

export const deleteMenuItem = async (req, res) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu)
    return res.status(404).json({ message: "Not found" });

  if (menu.restaurant.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Not authorized" });

  await menu.deleteOne();
  res.json({ message: "Deleted" });
};

export const getRestaurantMenu = async (req, res) => {
  const menu = await Menu.find({
    restaurant: req.user._id,
  });

  res.json(menu);
};