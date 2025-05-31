import express, { Request, Response } from "express"
import { Review } from "../models/Review"
const router = express.Router()

router.get("/api/users/:id/reviews", async (req: Request, res: Response) => {
  const reviews = await Review.find({ reviewFor: req.params.id })
  res.send(reviews)
})

export { router as getUserReviewsRouter }
