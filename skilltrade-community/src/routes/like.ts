import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"
import {
  setCurrentUser,
  requireAuth,
  NotFoundError,
  BadRequestError,
} from "@cse-350/shared-library"

const router = Router()

router.post(
  "/api/community/posts/:id/like",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
      throw new NotFoundError()
    }
    if (post.authorId === req.currentUser!.id) {
      throw new BadRequestError("You cannot like your own post")
    }
    if (post.likes?.includes(req.currentUser!.id)) {
      post.likes = post.likes.filter(id => id !== req.currentUser!.id)
      await post.save()
      res.status(200).send({ message: "Post unliked successfully" })
      return
    }
    if (post.likes) {
      post.likes.push(req.currentUser!.id)
    } else {
      post.likes = [req.currentUser!.id]
    }
    await post.save()
    res.status(200).send({ message: "Post liked successfully" })
  }
)

export { router as likePostRouter }
