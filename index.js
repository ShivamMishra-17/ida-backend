const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Capture payment & log user data
app.post("/api/capture-payment", async (req, res) => {
  const {
    paymentId,
    name,
    email,
    contact,
    city,
    clinic,
    food,
    membership,
    amount,
  } = req.body;

  try {
    // Capture the payment
    const payment = await razorpay.payments.capture(
      paymentId,
      amount * 100,
      "INR"
    );

    console.log("✅ Payment Captured:", payment.id);

    // Prepare user data
    const userData = {
      name,
      email,
      contact,
      city,
      clinic,
      food,
      membership,
      paymentId,
      amount,
    };

    // Optional: Save to Google Sheets
    await axios.post(
      "https://script.google.com/macros/s/AKfycbwfPd_UnIA-J2Mw6uY5KBHWuwMEJ3JoE-23fdf6q36id8Z-pRBF3AVNRR8BkikH8_okQA/exec",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Payment captured and data stored",
        userData,
      });
  } catch (error) {
    console.error("❌ Error capturing payment:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Payment capture failed",
        error: error.message,
      });
  }
});

app.get("/", (req, res) => {
  res.send("Razorpay backend is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
