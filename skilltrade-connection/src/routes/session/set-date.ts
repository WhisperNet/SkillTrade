import express, { Request, Response } from "express"
import {
  NotFoundError,
  NotAuthorizeError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Session } from "../../models/Session"

const router = express.Router()

router.post(
  "/api/connections/active/:sessionId/set-date",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { date } = req.body
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
    session.nextSessionBeginsAt = date
    await session.save()
    res.status(200).send({ message: "Date set" })
  }
)

export { router as activeSessionRouterSetDate }
