import { Router, Request, Response } from "express"
import { body } from "express-validator"
import { Post } from "../models/Posts"
import {
  setCurrentUser,
  requestValidationHandler,
  requireAuth,
  NotFoundError,
  NotAuthorizeError,
  BadRequestError,
} from "@cse-350/shared-library"

const router = Router()

router.post(
  "/api/community/posts/:id/update",
  setCurrentUser,
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("toTeach")
      .isArray()
      .notEmpty()
      .withMessage("To teach is required")
      .custom(array => array.every((item: any) => typeof item === "string"))
      .withMessage("All skills in toTeach must be strings"),
    body("toLearn")
      .isArray()
      .notEmpty()
      .withMessage("To learn is required")
      .custom(array => array.every((item: any) => typeof item === "string"))
      .withMessage("All skills in toLearn must be strings"),
    body("availability").isArray().notEmpty().withMessage("Availability is required"),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { title, content, toTeach, toLearn, availability } = req.body

    const post = await Post.findById(req.params.id)
    if (!post) {
      throw new NotFoundError()
    }
    if (post.authorId !== req.currentUser!.id) {
      throw new NotAuthorizeError()
    }
    if (!req.currentUser.isPremium) {
      throw new BadRequestError("Only premium users can update posts")
    }
    const lowerCaseToTeach = toTeach.map((item: string) => item.toLowerCase())
    const lowerCaseToLearn = toLearn.map((item: string) => item.toLowerCase())
    post.set({
      title,
      content,
      toTeach: lowerCaseToTeach,
      toLearn: lowerCaseToLearn,
      availability,
    })
    await post.save()
    res.status(201).send(post)
  }
)

export { router as updatePostRouter }
