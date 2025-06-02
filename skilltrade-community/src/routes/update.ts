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
    body("toTeach").isArray().notEmpty().withMessage("To teach is required"),
    body("toLearn").isArray().notEmpty().withMessage("To learn is required"),
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
    post.set({
      title,
      content,
      toTeach,
      toLearn,
      availability,
    })
    await post.save()
    res.status(201).send(post)
  }
)

export { router as updatePostRouter }
