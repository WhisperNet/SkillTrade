import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"
import { requestValidationHandler } from "@cse-350/shared-library"
import { body } from "express-validator"

const router = Router()

router.post(
  "/api/community/search",
  [
    body("toLearn").isArray().withMessage("To learn is required").optional(),
    body("toTeach").isArray().withMessage("To teach is required").optional(),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { toLearn, toTeach } = req.body

    if (!toLearn.length && !toTeach.length) {
      const posts = await Post.find({})
      res.send(posts)
      return
    } else if (toLearn.length && !toTeach.length) {
      const lowerCaseToLearn = toLearn.map((item: string) => item.toLowerCase())
      const posts = await Post.find({ toLearn: { $in: lowerCaseToLearn } })
      res.send(posts)
      return
    } else if (!toLearn.length && toTeach.length) {
      const lowerCaseToTeach = toTeach.map((item: string) => item.toLowerCase())
      const posts = await Post.find({ toTeach: { $in: lowerCaseToTeach } })
      res.send(posts)
      return
    } else if (toLearn.length && toTeach.length) {
      const lowerCaseToLearn = toLearn.map((item: string) => item.toLowerCase())
      const lowerCaseToTeach = toTeach.map((item: string) => item.toLowerCase())
      const posts = await Post.find({
        $and: [{ toLearn: { $in: lowerCaseToLearn } }, { toTeach: { $in: lowerCaseToTeach } }],
      })
      res.send(posts)
      return
    }
    res.status(400).send({ errors: [{ message: "Invalid request" }] })
  }
)

export { router as searchPostRouter }
