import Menu from "../Models/Menu.js";

export const addMenuItem = async (req, res) => {
  const {
    name, price, category, image, description, isVeg, variations,
    dietaryType, discountPrice, isGstIncluded, spiceLevel,
    inStock, preparationTime, availableDays, availableTime, tags, addOns
  } = req.body;

  const parsedVariations = (variations ? JSON.parse(variations) : []).filter(v => v.name && v.name.trim() !== "" && v.price);
  const parsedAddOns = (addOns ? JSON.parse(addOns) : []).filter(a => a.name && a.name.trim() !== "" && a.price);
  const finalPrice = price || (parsedVariations.length > 0 ? parsedVariations[0].price : 0);

  const menu = await Menu.create({
    name,
    price: finalPrice,
    category,
    image,
    description,
    isVeg: isVeg === "true" || isVeg === true,
    dietaryType,
    discountPrice,
    isGstIncluded: isGstIncluded === "true" || isGstIncluded === true,
    spiceLevel,
    inStock: inStock === "true" || inStock === true,
    preparationTime,
    availableDays: availableDays ? JSON.parse(availableDays) : [],
    availableTime: availableTime ? JSON.parse(availableTime) : {},
    tags: tags ? JSON.parse(tags) : [],
    addOns: parsedAddOns,
    variations: parsedVariations,
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

  const fields = [
    "name", "price", "category", "image", "description",
    "dietaryType", "discountPrice", "spiceLevel", "preparationTime"
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) menu[field] = req.body[field];
  });

  if (req.body.isVeg !== undefined) {
    menu.isVeg = req.body.isVeg === "true" || req.body.isVeg === true;
  }
  if (req.body.isGstIncluded !== undefined) {
    menu.isGstIncluded = req.body.isGstIncluded === "true" || req.body.isGstIncluded === true;
  }
  if (req.body.inStock !== undefined) {
    menu.inStock = req.body.inStock === "true" || req.body.inStock === true;
  }

  // Handle JSON collections
  if (req.body.variations !== undefined) {
    const parsedV = JSON.parse(req.body.variations).filter(v => v.name && v.name.trim() !== "" && v.price);
    menu.variations = parsedV;

    // Sync price if variations were provided and either:
    // 1. Price was not provided in request
    // 2. Price provided is the same as existing (meaning user didn't explicitly change it to something else)
    if (parsedV.length > 0) {
      if (!req.body.price || Number(req.body.price) === menu.price) {
        menu.price = parsedV[0].price;
      }
    }
  }
  if (req.body.addOns !== undefined) {
    menu.addOns = JSON.parse(req.body.addOns).filter(a => a.name && a.name.trim() !== "" && a.price);
  }
  if (req.body.tags !== undefined) menu.tags = JSON.parse(req.body.tags);
  if (req.body.availableDays !== undefined) menu.availableDays = JSON.parse(req.body.availableDays);
  if (req.body.availableTime !== undefined) menu.availableTime = JSON.parse(req.body.availableTime);

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