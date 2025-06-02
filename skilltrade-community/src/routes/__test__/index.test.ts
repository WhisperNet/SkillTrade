import request from "supertest"
import { app } from "../../app"
import { Post } from "../../models/Posts"
import mongoose from "mongoose"

it("returns all posts", async () => {
  const createdPost = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["Test Skill"],
    toLearn: ["Test Skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: new mongoose.Types.ObjectId().toHexString(),
    authorName: "test",
    authorProfilePicture: "test",
    isPremium: false,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  })
  await createdPost.save()
  const response = await request(app).get("/api/community/posts").send({})

  expect(response.status).toEqual(200)
  expect(response.body).toHaveLength(1)
  expect(response.body[0].title).toEqual("Test Post")
  expect(response.body[0].content).toEqual("Test Content")
  expect(response.body[0].toTeach).toEqual(["Test Skill"])
  expect(response.body[0].toLearn).toEqual(["Test Skill"])
  expect(response.body[0].availability).toEqual([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
})
