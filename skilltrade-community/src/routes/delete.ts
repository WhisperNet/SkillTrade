import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"
import {
  setCurrentUser,
  requireAuth,
  NotAuthorizeError,
  NotFoundError,
} from "@cse-350/shared-library"
import { PostDeletedPublisher } from "../events/publishers/post-deleted-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = Router()

router.post(
  "/api/community/posts/:id/delete",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
      throw new NotFoundError()
    }
    if (post.authorId !== req.currentUser!.id) {
      throw new NotAuthorizeError()
    }
    await post.deleteOne()
    await new PostDeletedPublisher(natsWrapper.client).publish({
      postId: post.id,
    })
    res.status(200).send({ message: "Post deleted successfully" })
  }
)
export { router as deletePostRouter }
