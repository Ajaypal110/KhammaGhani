import Reservation from "../Models/Reservation.js";

// USER: Book table
export const createReservation = async (req, res) => {
  try {
    const { name, phone, date, time, guests } = req.body;

    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      name,
      phone,
      date,
      time,
      guests,
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: My reservations
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: All reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Update reservation status
export const updateReservationStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = req.body.status || reservation.status;
    const updated = await reservation.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
