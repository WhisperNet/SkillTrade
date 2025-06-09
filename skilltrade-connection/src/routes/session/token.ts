import express, { Request, Response } from "express"
import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  setCurrentUser,
} from "@cse-350/shared-library"
import { RtcTokenBuilder, RtcRole } from "agora-token"
import { Session } from "../../models/Session"

const router = express.Router()

router.post(
  "/api/connections/active/:sessionId/token",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { sessionId } = req.params
    const { role } = req.body
    const userId = req.currentUser?.id

    // Validate role
    if (!role || !["host", "audience"].includes(role)) {
      throw new BadRequestError("Role must be either 'host' or 'audience'")
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

    // Generate RTC token
    const appID = process.env.AGORA_APP_ID!
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!

    if (!appID || !appCertificate) {
      throw new BadRequestError("Agora credentials not configured")
    }

    const channelName = sessionId
    // Create unique UID by combining user ID with a role-based suffix to avoid conflicts
    const baseUid = parseInt(userId!)
    const uid = role === "host" ? baseUid * 10 + 1 : baseUid * 10 + 2
    // Both users should be publishers for two-way video interaction
    const roleType = RtcRole.PUBLISHER
    const expirationTimeInSeconds = 3600 // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Generate RTC token for video/audio
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      roleType,
      privilegeExpiredTs,
      privilegeExpiredTs
    )

    res.status(200).send({
      token: rtcToken,
      uid,
      role,
    })
  }
)

export { router as activeSessionRouterToken }
