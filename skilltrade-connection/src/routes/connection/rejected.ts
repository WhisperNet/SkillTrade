import express, { Request, Response } from "express"
import { Connection } from "../../models/Connection"
import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { natsWrapper } from "../../nats-wrapper"
import { ConnectionRejectedPublisher } from "../../events/publishers/connection-rejected-publisher"

const router = express.Router()

router.get(
  "/api/connections/:connectionId/reject",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { connectionId } = req.params
    const connection = await Connection.findById(connectionId)
    if (!connection) {
      throw new NotFoundError()
    }
    if (connection.postAuthorId !== req.currentUser?.id) {
      throw new NotAuthorizeError()
    }
    await new ConnectionRejectedPublisher(natsWrapper.client).publish({
      postId: connection.postId,
      postAuthorId: connection.postAuthorId,
      requestedUserId: connection.requestedUserId,
    })
    await Connection.findByIdAndDelete(connectionId)
    res.status(200).send({ message: "Connection rejected" })
  }
)

export { router as rejectedRouter }
