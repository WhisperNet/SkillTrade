import express, { Request, Response } from "express"
import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { Session } from "../../models/Session"

const router = express.Router()
//////////////////////////////////////
//TO-DO: Use Redis instaed of memory//
//////////////////////////////////////
const sessionMessages: { [sessionId: string]: any[] } = {}

router.post(
  "/api/connections/active/:sessionId/messages",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { message } = req.body
    const userId = req.currentUser?.id

    if (!message || message.trim() === "") {
      throw new BadRequestError("Message cannot be empty")
    }

    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }

    if (session.sessionTakerOneId !== userId && session.sessionTakerTwoId !== userId) {
      throw new NotAuthorizeError()
    }

    const senderName =
      userId === session.sessionTakerOneId
        ? session.sessionTakerOneName
        : session.sessionTakerTwoName

    const messageData = {
      id: Date.now().toString(),
      senderId: userId,
      senderName,
      content: message.trim(),
      timestamp: new Date(),
    }

    if (!sessionMessages[sessionId]) {
      sessionMessages[sessionId] = []
    }
    sessionMessages[sessionId].push(messageData)

    if (sessionMessages[sessionId].length > 100) {
      sessionMessages[sessionId] = sessionMessages[sessionId].slice(-100)
    }

    res.status(201).send(messageData)
  }
)

router.get(
  "/api/connections/active/:sessionId/messages",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { since } = req.query
    const userId = req.currentUser?.id

    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }

    if (session.sessionTakerOneId !== userId && session.sessionTakerTwoId !== userId) {
      throw new NotAuthorizeError()
    }

    let messages = sessionMessages[sessionId] || []

    if (since) {
      const sinceDate = new Date(since as string)
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate)
    }

    res.status(200).send(messages)
  }
)

export { router as messagesRouter }
