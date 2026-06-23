import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TlKskFRkqia8IAhXZie0dbg",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: { userEmail: req.user.email },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/verify-session", verifyToken, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    if (session.payment_status === "paid") {
      const email = session.metadata.userEmail;
      await User.findOneAndUpdate({ email }, { isPremium: true });
      return res.json({ success: true });
    }

    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;