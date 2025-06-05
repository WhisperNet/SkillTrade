import { Router, Request, Response } from "express"
import { Post } from "../models/Posts"
import { natsWrapper } from "../nats-wrapper"
import { ConnectionRequestedPublisher } from "../events/publishers/connection-requested-publisher"
import { ConnectionCancelledPublisher } from "../events/publishers/connection-cancelled-publisher"
import { BadRequestError, requireAuth, setCurrentUser } from "@cse-350/shared-library"
import { NotFoundError } from "@cse-350/shared-library"

const router = Router()
router.post(
  "/api/community/posts/:id/connection",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id: postId } = req.params
    const foundPost = await Post.findById(postId)

    if (!foundPost) throw new NotFoundError()
    if (foundPost.authorId === req.currentUser?.id)
      throw new BadRequestError("You cannot request a connection to your own post")
    if (foundPost.connectionAccepted?.includes(req.currentUser?.id))
      throw new BadRequestError("The request has already been accepted")
    if (foundPost.connections?.includes(req.currentUser?.id)) {
      foundPost.connections = foundPost.connections?.filter(id => id !== req.currentUser?.id)
      await foundPost.save()
      await new ConnectionCancelledPublisher(natsWrapper.client).publish({
        postId: foundPost.id,
        postAuthorId: foundPost.authorId,
        requestedUserId: req.currentUser?.id,
      })
    } else {
      if (foundPost.connections) foundPost.connections.push(req.currentUser?.id)
      else foundPost.connections = [req.currentUser?.id]
      await foundPost.save()
      await new ConnectionRequestedPublisher(natsWrapper.client).publish({
        postId: foundPost.id,
        postTitle: foundPost.title,
        postAuthorId: foundPost.authorId,
        requestedUserId: req.currentUser?.id,
        toLearn: foundPost.toLearn,
        toTeach: foundPost.toTeach,
        requestedUserName: req.currentUser?.fullName,
        requestedUserProfilePicture: req.currentUser?.profilePicture,
      })
    }
    res.status(200).json({
      message: "Connection requested",
    })
  }
)

export { router as connectionRouter }
