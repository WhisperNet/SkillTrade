import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Post } from "../../models/Posts"

it("deletes a post for the author", async () => {
  const authorId = new mongoose.Types.ObjectId().toHexString()
  const createdPost = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["Test Skill"],
    toLearn: ["Test Skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: authorId,
    authorName: "test",
    authorProfilePicture: "test",
    isPremium: false,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  })
  await createdPost.save()
  const response = await request(app)
    .post(`/api/community/posts/${createdPost.id}/delete`)
    .set("Cookie", await global.signin(authorId))
    .send({})

  expect(response.status).toEqual(200)
  expect(await Post.find({})).toHaveLength(0)
})

it("does not delete a post for a non-author", async () => {
  const authorId = new mongoose.Types.ObjectId().toHexString()
  const createdPost = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["Test Skill"],
    toLearn: ["Test Skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: authorId,
    authorName: "test",
    authorProfilePicture: "test",
    isPremium: false,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  })
  await createdPost.save()
  const response = await request(app)
    .post(`/api/community/posts/${createdPost.id}/delete`)
    .set("Cookie", await global.signin())
    .send({})
  expect(response.status).toEqual(403)
  expect(await Post.find({})).toHaveLength(1)
})
