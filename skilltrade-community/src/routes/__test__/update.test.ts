import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Post } from "../../models/Posts"

it("updates a post for the premium author", async () => {
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
    .post(`/api/community/posts/${createdPost.id}/update`)
    .set("Cookie", await global.signin(authorId, true))
    .send({
      title: "Test Post 2",
      content: "Test Content 2",
      toTeach: ["Test Skill 2"],
      toLearn: ["Test Skill 2"],
      availability: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    })
  expect(response.status).toEqual(201)
  const foundPost = await Post.findById(createdPost.id)
  expect(foundPost!.title).toEqual("Test Post 2")
  expect(foundPost!.content).toEqual("Test Content 2")
  expect(foundPost!.toTeach).toEqual(["Test Skill 2"])
  expect(foundPost!.toLearn).toEqual(["Test Skill 2"])
  expect(foundPost!.availability).toEqual(["sunday", "monday", "tuesday", "wednesday", "thursday"])
})

it("does not update a post for a non-premium author", async () => {
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
    .post(`/api/community/posts/${createdPost.id}/update`)
    .set("Cookie", await global.signin(authorId))
    .send({
      title: "Test Post 2",
      content: "Test Content 2",
      toTeach: ["Test Skill 2"],
      toLearn: ["Test Skill 2"],
      availability: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    })
  expect(response.status).toEqual(400)
  const foundPost = await Post.findById(createdPost.id)
  expect(foundPost!.title).toEqual("Test Post")
  expect(foundPost!.content).toEqual("Test Content")
  expect(foundPost!.toTeach).toEqual(["Test Skill"])
  expect(foundPost!.toLearn).toEqual(["Test Skill"])
  expect(foundPost!.availability).toEqual([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
})

it("does not update a post for a unautorized author", async () => {
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
    .post(`/api/community/posts/${createdPost.id}/update`)
    .set("Cookie", await global.signin(new mongoose.Types.ObjectId().toHexString(), true))
    .send({
      title: "Test Post 2",
      content: "Test Content 2",
      toTeach: ["Test Skill 2"],
      toLearn: ["Test Skill 2"],
      availability: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    })
  expect(response.status).toEqual(403)
  const foundPost = await Post.findById(createdPost.id)
  expect(foundPost!.title).toEqual("Test Post")
  expect(foundPost!.content).toEqual("Test Content")
  expect(foundPost!.toTeach).toEqual(["Test Skill"])
  expect(foundPost!.toLearn).toEqual(["Test Skill"])
  expect(foundPost!.availability).toEqual([
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
})
