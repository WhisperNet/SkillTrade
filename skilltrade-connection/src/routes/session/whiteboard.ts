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

// In-memory storage for whiteboard data (in production, use Redis or database)
const sessionWhiteboards: { [sessionId: string]: any[] } = {}

interface DrawingAction {
  id: string
  type: "draw" | "clear"
  userId: string
  userName: string
  timestamp: Date
  data?: {
    x: number
    y: number
    prevX?: number
    prevY?: number
    color: string
    brushSize: number
  }
}

// Send drawing action
router.post(
  "/api/connections/active/:sessionId/whiteboard",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { type, data } = req.body
    const userId = req.currentUser?.id

    if (!type || !["draw", "clear"].includes(type)) {
      throw new BadRequestError("Invalid drawing action type")
    }

    if (type === "draw" && (!data || typeof data.x !== "number" || typeof data.y !== "number")) {
      throw new BadRequestError("Invalid drawing data")
    }

    // Get the session
    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }

    // Check if user is part of the session
    if (session.sessionTakerOneId !== userId && session.sessionTakerTwoId !== userId) {
      throw new NotAuthorizeError()
    }

    // Get user name
    const userName =
      userId === session.sessionTakerOneId
        ? session.sessionTakerOneName
        : session.sessionTakerTwoName

    // Create drawing action
    const drawingAction: DrawingAction = {
      id: Date.now().toString(),
      type,
      userId: userId!,
      userName,
      timestamp: new Date(),
      data: type === "draw" ? data : undefined,
    }

    // Store drawing action
    if (!sessionWhiteboards[sessionId]) {
      sessionWhiteboards[sessionId] = []
    }

    // If it's a clear action, remove all previous actions
    if (type === "clear") {
      sessionWhiteboards[sessionId] = [drawingAction]
    } else {
      sessionWhiteboards[sessionId].push(drawingAction)
    }

    // Keep only last 1000 actions to prevent memory issues
    if (sessionWhiteboards[sessionId].length > 1000) {
      sessionWhiteboards[sessionId] = sessionWhiteboards[sessionId].slice(-1000)
    }

    res.status(201).send(drawingAction)
  }
)

// Get whiteboard data for a session
router.get(
  "/api/connections/active/:sessionId/whiteboard",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { since } = req.query
    const userId = req.currentUser?.id

    // Get the session
    const session = await Session.findById(sessionId)
    if (!session) {
      throw new NotFoundError()
    }

    // Check if user is part of the session
    if (session.sessionTakerOneId !== userId && session.sessionTakerTwoId !== userId) {
      throw new NotAuthorizeError()
    }

    // Get drawing actions
    let actions = sessionWhiteboards[sessionId] || []

    // If 'since' timestamp is provided, return only newer actions
    if (since) {
      const sinceDate = new Date(since as string)
      actions = actions.filter(action => new Date(action.timestamp) > sinceDate)
    }

    res.status(200).send(actions)
  }
)

export { router as whiteboardRouter }
