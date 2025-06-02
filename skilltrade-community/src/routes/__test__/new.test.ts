import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Post } from "../../models/Posts"

it("has a route handler listening to /api/community/posts for post requests", async () => {
  const response = await request(app).post("/api/community/posts").send({})

  expect(response.status).not.toEqual(404)
})

it("creates a post with valid inputs", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app)
    .post("/api/community/posts")
    .set("Cookie", await global.signin(id))
    .send({
      title: "Test Post",
      content: "Test Content",
      toTeach: ["Test Skill"],
      toLearn: ["Test Skill"],
      availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    })

  expect(response.status).toEqual(201)
  expect(response.body.title).toEqual("Test Post")
  expect(response.body.content).toEqual("Test Content")
  expect(response.body.toTeach).toEqual(["Test Skill"])
  expect(response.body.toLearn).toEqual(["Test Skill"])
  expect(response.body.availability).toEqual([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
  expect(response.body.authorId).toEqual(id)
  expect(response.body.authorName).toEqual("test")
  expect(response.body.authorProfilePicture).toEqual("test")
  expect(response.body.isPremium).toEqual(false)
  expect(response.body.createdAt).toBeDefined()
  expect(response.body.updatedAt).toBeDefined()
})

it("clears up old posts", async () => {
  const tobeDeleted = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["Test Skill"],
    toLearn: ["Test Skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: new mongoose.Types.ObjectId().toHexString(),
    authorName: "test",
    authorProfilePicture: "test",
    isPremium: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  })
  await tobeDeleted.save()
  const tobeDeleted2 = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["Test Skill"],
    toLearn: ["Test Skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: new mongoose.Types.ObjectId().toHexString(),
    authorName: "test",
    authorProfilePicture: "test",
    isPremium: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  })
  await tobeDeleted2.save()
  for (let i = 0; i < 100; i++) {
    const response = await request(app)
      .post("/api/community/posts")
      .set("Cookie", await global.signin())
      .send({
        title: "Test Post",
        content: "Test Content",
        toTeach: ["Test Skill"],
        toLearn: ["Test Skill"],
        availability: [
          "saturday",
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
      })
    expect(response.status).toEqual(201)
  }
  expect(await Post.find({})).toHaveLength(100)
})
