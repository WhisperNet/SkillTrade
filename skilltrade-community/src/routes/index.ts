import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"

const router = Router()

router.get("/api/community/posts", async (req: Request, res: Response) => {
  const posts = await Post.find({})
  res.send(posts)
})

export { router as indexPostRouter }
