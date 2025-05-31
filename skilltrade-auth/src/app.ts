import express from "express"
import cookieSession from "cookie-session"
import { currentUserRouter } from "./routes/current-user"
import { signinRouter } from "./routes/signin"
import { signupRouter } from "./routes/signup"
import { signoutRouter } from "./routes/signout"
import { errorHandler, NotFoundError } from "@cse-350/shared-library"
import { updateRouter } from "./routes/update"
import { getUserRouter } from "./routes/get-user"
import { getUserReviewsRouter } from "./routes/review"

const app = express()
app.set("trust proxy", true)
app.use(express.json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
)
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(updateRouter)
app.use(getUserRouter)
app.use(getUserReviewsRouter)
app.all("*splat", (req, res) => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
