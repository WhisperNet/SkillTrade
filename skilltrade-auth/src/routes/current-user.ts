import express from "express"
import { setCurrentUser } from "@cse-350/shared-library"
const router = express.Router()

router.get("/api/users/currentuser", setCurrentUser, (req, res) => {
  res.status(200).send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
