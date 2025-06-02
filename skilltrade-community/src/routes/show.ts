import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"
import { NotFoundError } from "@cse-350/shared-library"

const router = Router()

router.get("/api/community/posts/:id", async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id)
  if (!post) {
    throw new NotFoundError()
  }
  res.send(post)
})

export { router as showPostRouter }
