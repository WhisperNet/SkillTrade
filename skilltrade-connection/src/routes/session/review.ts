import express, { Request, Response } from "express"
import { Session } from "../../models/Session"
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { ReviewCreatedPublisher } from "../../events/publishers/review-created-publisher"
import { natsWrapper } from "../../nats-wrapper"

const router = express.Router()
router.post(
  "/api/connections/active/:id/review",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { rating, comment } = req.body

    const session = await Session.findById(id)
    if (!session) {
      throw new NotFoundError()
    } else if (!session.isEnded) {
      throw new BadRequestError("Session is not ended")
    }

    if (session.sessionTakerOneId === req.currentUser?.id && !session.isReviewedByTakerOne) {
      session.isReviewedByTakerOne = true
      await session.save()
      await new ReviewCreatedPublisher(natsWrapper.client).publish({
        reviewContent: comment,
        reviewRating: rating,
        reviewAuthorId: req.currentUser?.id,
        reviewAuthorName: session.sessionTakerOneName,
        reviewAuthorProfilePicture: session.sessionTakerOneProfilePicture,
        reviewedUserId: session.sessionTakerTwoId,
      })
    } else if (session.sessionTakerTwoId === req.currentUser?.id && !session.isReviewedByTakerTwo) {
      session.isReviewedByTakerTwo = true
      await session.save()
      await new ReviewCreatedPublisher(natsWrapper.client).publish({
        reviewContent: comment,
        reviewRating: rating,
        reviewAuthorId: req.currentUser?.id,
        reviewAuthorName: session.sessionTakerTwoName,
        reviewAuthorProfilePicture: session.sessionTakerTwoProfilePicture,
        reviewedUserId: session.sessionTakerOneId,
      })
    } else {
      throw new BadRequestError("Invalid review submission")
    }

    res.status(201).send({ message: "Review submitted successfully" })
  }
)

export { router as reviewRouter }
