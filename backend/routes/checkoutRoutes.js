import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkoutService } from '../services/checkoutService.js';
const cartRouter = express.Router();

cartRouter.post("/checkout", authMiddleware, async (req, res, next) => {
  try {
    const session = await checkoutService(req.user.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default cartRouter;

