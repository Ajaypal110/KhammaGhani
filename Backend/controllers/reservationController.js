import Reservation from "../Models/Reservation.js";
import User from "../Models/User.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

// USER: Book table at a specific restaurant
export const createReservation = async (req, res) => {
  try {
    const { restaurantId, name, email, phone, date, timeFrom, timeTo, guests, tableNo, specialRequests, bookingAmount } = req.body;

    if (!restaurantId || !name || !phone || !date || !timeFrom || !timeTo || !guests || !tableNo) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    if (timeFrom >= timeTo) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Check if restaurant exists and table number is valid
    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (tableNo > (restaurant.totalTables || 10) || tableNo < 1) {
      return res.status(400).json({ message: `Invalid table number. Restaurant has ${restaurant.totalTables || 10} tables.` });
    }

    // Check overlapping bookings for same table + date (time overlap check)
    const existingBookings = await Reservation.find({
      restaurant: restaurantId,
      tableNo,
      date,
      status: { $in: ["Pending", "Confirmed"] },
    });

    const hasOverlap = existingBookings.some((b) => {
      return timeFrom < b.timeTo && timeTo > b.timeFrom;
    });

    if (hasOverlap) {
      return res.status(409).json({
        message: `Table ${tableNo} is already booked during ${timeFrom} - ${timeTo} on ${date}. Please choose a different table or time.`,
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      restaurant: restaurantId,
      name,
      email: email || "",
      phone,
      date,
      timeFrom,
      timeTo,
      guests,
      tableNo,
      specialRequests: specialRequests || "",
      bookingAmount: restaurant.bookingFee || bookingAmount || 199,
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Create Razorpay order for a reservation
export const createRazorpayOrder = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (reservation.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    if (reservation.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot pay for a cancelled reservation" });
    }

    const amountInPaise = (reservation.bookingAmount || 199) * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${reservation._id}`,
      notes: {
        reservationId: reservation._id.toString(),
        restaurantId: reservation.restaurant.toString(),
      },
    });

    // Save Razorpay order ID to reservation
    reservation.razorpayOrderId = order.id;
    await reservation.save();

    // Get restaurant info for Razorpay prefill
    const restaurant = await User.findById(reservation.restaurant).select("name upiId");

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      restaurantName: restaurant?.name || "Khamma Ghani",
      restaurantUpi: restaurant?.upiId || "",
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// USER: Verify Razorpay payment and mark reservation as paid
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Find reservation by Razorpay order ID
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Generate receipt ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    reservation.paymentStatus = "Paid";
    reservation.paymentMethod = "Razorpay";
    reservation.paymentId = razorpay_payment_id;
    reservation.receiptId = `KG-${timestamp}-${random}`;
    reservation.razorpayOrderId = razorpay_order_id;
    reservation.paidAt = new Date();

    const updated = await reservation.save();

    // Populate restaurant info for receipt
    const populated = await Reservation.findById(updated._id).populate("restaurant", "name email restaurantId upiId");

    res.json({
      message: "Payment successful!",
      reservation: populated,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

// USER: Get booked tables for a restaurant on a specific date + time range
export const getBookedTables = async (req, res) => {
  try {
    const { restaurantId, date, timeFrom, timeTo } = req.query;

    if (!restaurantId || !date || !timeFrom || !timeTo) {
      return res.status(400).json({ message: "restaurantId, date, timeFrom, and timeTo are required" });
    }

    const bookedReservations = await Reservation.find({
      restaurant: restaurantId,
      date,
      status: { $in: ["Pending", "Confirmed"] },
    }).select("tableNo timeFrom timeTo");

    // Filter for overlapping time ranges
    const bookedTables = bookedReservations
      .filter((r) => timeFrom < r.timeTo && timeTo > r.timeFrom)
      .map((r) => r.tableNo);

    // Return unique table numbers
    res.json([...new Set(bookedTables)]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: My reservations
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      user: req.user._id,
    })
      .populate("restaurant", "name email restaurantId")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Cancel my reservation
export const cancelMyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Only the user who booked can cancel
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (reservation.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    reservation.status = "Cancelled";
    const updated = await reservation.save();

    res.json({ message: "Booking cancelled successfully", reservation: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT: Get bookings for my restaurant
export const getRestaurantBookings = async (req, res) => {
  try {
    const bookings = await Reservation.find({
      restaurant: req.user._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: All reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .populate("restaurant", "name email")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT/ADMIN: Update reservation status
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
