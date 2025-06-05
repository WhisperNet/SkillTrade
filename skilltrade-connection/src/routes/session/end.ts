import express, { Request, Response } from "express"
import {
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Session } from "../../models/Session"

const router = express.Router()

router.post(
  "/api/connections/active/:sessionId/end",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }
    if (
      session.sessionTakerOneId !== req.currentUser?.id &&
      session.sessionTakerTwoId !== req.currentUser?.id
    ) {
      throw new NotAuthorizeError()
    }
    session.isEnded = true
    await session.save()
    res.status(200).send({ message: "Session ended" })
  }
)

export { router as activeSessionRouterEnd }
