import express from "express"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError } from "@cse-350/shared-library"
import { connectionRouter } from "./routes/connection/index"
import { acceptedRouter } from "./routes/connection/accepted"
import { rejectedRouter } from "./routes/connection/rejected"
import { activeSessionRouterIndex } from "./routes/session"
import { activeSessionRouterSetDate } from "./routes/session/set-date"
import { activeSessionRouterShow } from "./routes/session/show"
import { activeSessionRouterEnd } from "./routes/session/end"
import { reviewRouter } from "./routes/session/review"
import { activeSessionRouterToken } from "./routes/session/token"
import { messagesRouter } from "./routes/session/messages"
import { whiteboardRouter } from "./routes/session/whiteboard"

const app = express()
app.set("trust proxy", true)
app.use(express.json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
)
app.use(connectionRouter)
app.use(acceptedRouter)
app.use(rejectedRouter)
app.use(activeSessionRouterIndex)
app.use(activeSessionRouterSetDate)
app.use(activeSessionRouterShow)
app.use(activeSessionRouterEnd)
app.use(reviewRouter)
app.use(activeSessionRouterToken)
app.use(messagesRouter)
app.use(whiteboardRouter)
app.all("*splat", (req, res) => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
