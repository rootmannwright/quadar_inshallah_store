// routes/checkoutRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkoutService } from '../services/checkoutService.js';

const cartRouter = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas de checkout. Tente novamente mais tarde.",
  },
});

cartRouter.post("/checkout", checkoutLimiter, authMiddleware, async (req, res, next) => {
  try {
    const session = await checkoutService(req.user.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default cartRouter;