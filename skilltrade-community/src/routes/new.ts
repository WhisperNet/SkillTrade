import { Router, Request, Response } from "express"
import { body } from "express-validator"
import { Post } from "../models/Posts"
import { setCurrentUser, requestValidationHandler, requireAuth } from "@cse-350/shared-library"

const router = Router()

async function cleanupOldPosts() {
  const currentTime = new Date()
  const roll = Math.floor(Math.random() * 25)
  if (roll === 10) {
    await Post.deleteMany({
      createdAt: {
        $lte: new Date(currentTime.getTime() - 1000 * 60 * 60 * 24),
      },
      isPremium: false,
    })
  }
  if (roll === 20) {
    await Post.deleteMany({
      createdAt: {
        $lte: new Date(currentTime.getTime() - 1000 * 60 * 60 * 24 * 7),
      },
      isPremium: true,
    })
  }
}

router.post(
  "/api/community/posts",
  setCurrentUser,
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("toTeach").isArray().notEmpty().withMessage("To teach is required"),
    body("toLearn").isArray().notEmpty().withMessage("To learn is required"),
    body("availability").isArray().notEmpty().withMessage("Availability is required"),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { title, content, toTeach, toLearn, availability } = req.body
    // make all the entry of the toLearn and toTeach array lowercase
    const lowerCaseToLearn = toLearn.map((item: string) => item.toLowerCase())
    const lowerCaseToTeach = toTeach.map((item: string) => item.toLowerCase())

    // Clean up old posts before creating new one
    await cleanupOldPosts()

    const post = await Post.build({
      title,
      content,
      toTeach: lowerCaseToTeach,
      toLearn: lowerCaseToLearn,
      authorId: req.currentUser!.id,
      authorName: req.currentUser!.fullName,
      authorProfilePicture: req.currentUser!.profilePicture,
      isPremium: req.currentUser!.isPremium,
      availability,
    })

    await post.save()
    res.status(201).send(post)
  }
)

export { router as newPostRouter }
