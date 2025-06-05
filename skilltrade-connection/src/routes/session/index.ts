import express, { Request, Response } from "express"
import { body } from "express-validator"
import { requireAuth, setCurrentUser } from "@cse-350/shared-library"
import { Session } from "../../models/Session"

const router = express.Router()

router.get(
  "/api/connections/active",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const foundSession = await Session.find({
      $or: [{ sessionTakerOneId: req.currentUser?.id }, { sessionTakerTwoId: req.currentUser?.id }],
    })
    res.status(200).send(foundSession || [])
  }
)

export { router as activeSessionRouterIndex }
