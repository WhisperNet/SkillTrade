import express, { Request, Response } from "express"
import { Connection } from "../../models/Connection"
import { setCurrentUser, requireAuth } from "@cse-350/shared-library"

const router = express.Router()

router.get("/api/connections", setCurrentUser, requireAuth, async (req: Request, res: Response) => {
  const connections = await Connection.find({
    postAuthorId: req.currentUser?.id,
  })
  res.status(200).send(connections)
})

export { router as connectionRouter }
