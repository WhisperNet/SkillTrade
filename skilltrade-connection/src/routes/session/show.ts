import express, { Request, Response } from "express"
import {
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Session } from "../../models/Session"

const router = express.Router()

router.get(
  "/api/connections/active/:sessionId",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const userId = req.currentUser?.id
    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }
    if (session.sessionTakerOneId !== userId && session.sessionTakerTwoId !== userId) {
      throw new NotAuthorizeError()
    }
    res.status(200).send(session)
  }
)

export { router as activeSessionRouterShow }
