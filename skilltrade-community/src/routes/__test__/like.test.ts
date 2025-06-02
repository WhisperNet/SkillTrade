import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Post } from "../../models/Posts"

it("likes and dislikes a post", async () => {
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
  const likerCookie = await global.signin()
  const likerId = new mongoose.Types.ObjectId().toHexString()
  let response = await request(app)
    .post(`/api/community/posts/${createdPost.id}/like`)
    .set("Cookie", likerCookie)
    .send({})
  expect(response.status).toEqual(200)
  let foundPost = await Post.findById(createdPost.id)
  expect(foundPost!.likes).toHaveLength(1)
  response = await request(app)
    .post(`/api/community/posts/${createdPost.id}/like`)
    .set("Cookie", likerCookie)
    .send({})
  expect(response.status).toEqual(200)
  foundPost = await Post.findById(createdPost.id)
  expect(foundPost!.likes).toHaveLength(0)
})

it("doen't let an author to like his post", async () => {
  const authorCookie = await global.signin()
  const { body: createdPost } = await request(app)
    .post("/api/community/posts")
    .set("Cookie", authorCookie)
    .send({
      title: "Test Post",
      content: "Test Content",
      toTeach: ["Test Skill"],
      toLearn: ["Test Skill"],
      availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    })
  const response = await request(app)
    .post(`/api/community/posts/${createdPost.id}/like`)
    .set("Cookie", authorCookie)
    .send({})
  expect(response.status).toEqual(400)
})
