import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"

it("returns the post if it exists", async () => {
  const { body: createdPost } = await request(app)
    .post("/api/community/posts")
    .set("Cookie", await global.signin())
    .send({
      title: "Test Post",
      content: "Test Content",
      toTeach: ["Test Skill"],
      toLearn: ["Test Skill"],
      availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    })
    .expect(201)
  const response = await request(app).get(`/api/community/posts/${createdPost.id}`).send({})

  expect(response.status).toEqual(200)
  expect(response.body.title).toEqual("Test Post")
  expect(response.body.content).toEqual("Test Content")
  expect(response.body.toTeach).toEqual(["test skill"])
  expect(response.body.toLearn).toEqual(["test skill"])
  expect(response.body.availability).toEqual([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
})

it("returns 404 if the post does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app).get(`/api/community/posts/${id}`).send({})

  expect(response.status).toEqual(404)
})
