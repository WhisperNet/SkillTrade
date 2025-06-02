import express from "express"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError } from "@cse-350/shared-library"
import { newPostRouter } from "./routes/new"
import { showPostRouter } from "./routes/show"
import { indexPostRouter } from "./routes/index"
import { likePostRouter } from "./routes/like"
import { deletePostRouter } from "./routes/delete"
import { updatePostRouter } from "./routes/update"

const app = express()
app.set("trust proxy", true)
app.use(express.json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
)

app.use(newPostRouter)
app.use(showPostRouter)
app.use(indexPostRouter)
app.use(likePostRouter)
app.use(deletePostRouter)
app.use(updatePostRouter)
app.all("*splat", (req, res) => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
