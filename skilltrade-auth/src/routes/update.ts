import express, { NextFunction, Request, Response } from "express"
import { User } from "../models/User"
import { body } from "express-validator"
import {
  NotFoundError,
  requestValidationHandler,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Availability, Occupation } from "../types/auth"
import JWT from "jsonwebtoken"
const router = express.Router()

router.post(
  "/api/users/update",
  setCurrentUser,
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("occupation")
      .trim()
      .notEmpty()
      .withMessage("Occupation is required")
      .custom(value => {
        if (!Object.values(Occupation).includes(value)) {
          throw new Error("Invalid occupation value")
        }
        return true
      })
      .withMessage("Please provide a valid occupation"),
    body("availability")
      .trim()
      .notEmpty()
      .withMessage("Availability is required")
      .custom(value => {
        if (!Object.values(Availability).includes(value)) {
          throw new Error("Invalid availability value")
        }
        return true
      })
      .withMessage("Please provide a valid availability"),
  ],
  requireAuth,
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { fullName, description, occupation, availability } = req.body
    const user = await User.findById(req.currentUser?.id)
    if (!user) {
      throw new NotFoundError()
    }
    user.fullName = fullName
    user.description = description
    user.occupation = occupation
    user.availability = availability
    await user.save()
    const jsonToken = JWT.sign(
      {
        id: user.id,
        email: user.email,
        profilePicture: user.profilePicture,
        fullName: user.fullName,
        isPremium: user.isPremium,
      },
      process.env.JWT_KEY!
    )
    req.session = {
      JWT: jsonToken,
    }
    res.status(200).send({ currentUser: user })
  }
)

export { router as updateRouter }
