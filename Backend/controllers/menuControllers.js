import Menu from "../models/Menu.js";

// ADMIN: Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const menuItem = await Menu.create({
      name,
      description,
      price,
      category,
      image,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUBLIC: Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const menu = await Menu.find({ isAvailable: true });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const { name, description, price, category, image, isAvailable } = req.body;

    menuItem.name = name ?? menuItem.name;
    menuItem.description = description ?? menuItem.description;
    menuItem.price = price ?? menuItem.price;
    menuItem.category = category ?? menuItem.category;
    menuItem.image = image ?? menuItem.image;
    menuItem.isAvailable =
      isAvailable !== undefined ? isAvailable : menuItem.isAvailable;

    const updated = await menuItem.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
