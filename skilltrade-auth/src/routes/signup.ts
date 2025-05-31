import express, { Request, Response } from "express"
import JWT from "jsonwebtoken"
import { User } from "../models/User"
import { body } from "express-validator"
import { BadRequestError, requestValidationHandler } from "@cse-350/shared-library"
import { Occupation, Availability, Gender } from "../types/auth"
const router = express.Router()

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 char long"),
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
    body("gender")
      .trim()
      .notEmpty()
      .withMessage("Gender is required")
      .custom(value => {
        if (!Object.values(Gender).includes(value)) {
          throw new Error("Invalid gender value")
        }
        return true
      })
      .withMessage("Please provide a valid gender"),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { email, password, fullName, description, occupation, availability, gender } = req.body
    const foundUser = await User.findOne({ email })
    if (foundUser) throw new BadRequestError("Email already exists")
    let profilePicture
    if (gender === "male")
      profilePicture = `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 44) + 1}`
    else
      profilePicture = `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 44) + 61}`
    const user = await User.build({
      email,
      password,
      fullName,
      description,
      occupation,
      availability,
      gender,
      profilePicture,
    })
    const jsonToekn = JWT.sign(
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
      JWT: jsonToekn,
    }
    res.status(201).send({ currentUser: user })
  }
)

export { router as signupRouter }
