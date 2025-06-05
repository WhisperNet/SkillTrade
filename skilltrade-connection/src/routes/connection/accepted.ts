import express, { Request, Response } from "express"
import { Connection } from "../../models/Connection"
import {
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { natsWrapper } from "../../nats-wrapper"
import { ConnectionAcceptedPublisher } from "../../events/publishers/connection-accepted-publisher"
import { Session } from "../../models/Session"

const router = express.Router()

router.get(
  "/api/connections/:connectionId/accept",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { connectionId } = req.params
    const connection = await Connection.findByIdAndDelete(connectionId)
    if (!connection) {
      throw new NotFoundError()
    }
    if (connection.postAuthorId !== req.currentUser?.id) {
      throw new NotAuthorizeError()
    }
    await Session.build({
      sessionTakerOneId: connection.postAuthorId,
      sessionTakerTwoId: connection.requestedUserId,
      sessionTakerOneName: req.currentUser?.fullName,
      sessionTakerTwoName: connection.requestedUserName,
      sessionTakerOneProfilePicture: req.currentUser?.profilePicture,
      sessionTakerTwoProfilePicture: connection.requestedUserProfilePicture,
      toTeach: connection.toTeach,
      toLearn: connection.toLearn,
    })
    await new ConnectionAcceptedPublisher(natsWrapper.client).publish({
      postId: connection.postId,
      postAuthorId: connection.postAuthorId,
      requestedUserId: connection.requestedUserId,
    })

    res.status(200).send({ message: "Connection accepted" })
  }
)

export { router as acceptedRouter }
