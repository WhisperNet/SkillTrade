import express, { NextFunction, Request, Response } from "express"
import { User } from "../models/User"
import { body } from "express-validator"
import {
  NotFoundError,
  requestValidationHandler,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Occupation } from "../types/auth"
import JWT from "jsonwebtoken"

const validDays = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const

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
      .isArray()
      .withMessage("Availability must be an array")
      .notEmpty()
      .withMessage("At least one day must be selected")
      .custom((value: string[]) => {
        if (!Array.isArray(value)) return false
        return value.every(day => validDays.includes(day as (typeof validDays)[number]))
      })
      .withMessage("Please provide valid availability days"),
  ],
  requireAuth,
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { fullName, description, occupation, availability, password } = req.body
    const user = await User.findById(req.currentUser?.id)
    if (!user) {
      throw new NotFoundError()
    }
    user.fullName = fullName
    user.description = description
    user.occupation = occupation
    user.availability = availability
    if (password) {
      user.password = password
    }
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
