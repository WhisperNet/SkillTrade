import express, { Request, Response } from "express"
import { User } from "../models/User"
import { NotFoundError } from "@cse-350/shared-library"
import { Review } from "../models/Review"
const router = express.Router()

router.get("/api/users/:id", async (req: Request, res: Response) => {
  const user = await User.findById({ _id: req.params.id })
  if (!user) throw new NotFoundError()
  const reviews = await Review.find({ reviewFor: user.id })
  const isExperiencedTeacher = user.sessionsTaught ? user.sessionsTaught >= 10 : false
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0
  const total5StarReviews = reviews.filter(review => review.rating === 5).length
  const is5Star = total5StarReviews >= 5

  const userResponse = {
    id: user.id,
    email: user.email,
    profilePicture: user.profilePicture,
    fullName: user.fullName,
    description: user.description,
    occupation: user.occupation,
    availability: user.availability,
    gender: user.gender,
    sessionsTaught: user.sessionsTaught,
    isPremium: user.isPremium,
    avgRating,
    is5Star,
    isExperiencedTeacher,
  }

  res.json(userResponse)
})

export { router as getUserRouter }
