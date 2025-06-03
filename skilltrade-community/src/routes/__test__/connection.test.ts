import { app } from "../../app"
import request from "supertest"
import mongoose from "mongoose"
import { Post } from "../../models/Posts"
import { natsWrapper } from "../../nats-wrapper"
// authorId: string
// authorName: string
// authorProfilePicture: string
// isPremium: boolean
// title: string
// content: string
// availability: Array<
//   "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
// >
// likes?: string[]
// connections?: string[]
// toTeach: string[]
// toLearn: string[]
const startUp = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const post = await Post.create({
    title: "Test Post",
    content: "Test Content",
    toTeach: ["test skill"],
    toLearn: ["test skill"],
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    authorId: userId,
    connections: [],
    isPremium: false,
    authorName: "Test User",
    authorProfilePicture: "https://via.placeholder.com/150",
  })
  return post
}

beforeEach(() => {
  jest.clearAllMocks()
})

it("should return 404 if the post is not found", async () => {
  const response = await request(app)
    .post(`/api/community/posts/${new mongoose.Types.ObjectId().toHexString()}/connection`)
    .set("Cookie", await global.signin())
    .send({})
  expect(response.status).toEqual(404)
})

it("should return 400 if the user is the author of the post", async () => {
  const post = await startUp()
  const response = await request(app)
    .post(`/api/community/posts/${post._id}/connection`)
    .set("Cookie", await global.signin(post.authorId))
    .send({})
  expect(response.status).toEqual(400)
})

it("should return 200 if the user is not connected ", async () => {
  const post = await startUp()
  const response = await request(app)
    .post(`/api/community/posts/${post.id}/connection`)
    .set("Cookie", await global.signin())
    .send({})
  expect(response.status).toEqual(200)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
it("should return 200 if the user is connected ", async () => {
  const post = await startUp()
  const userId = new mongoose.Types.ObjectId().toHexString()
  post.connections?.push(userId)
  await post.save()
  const response = await request(app)
    .post(`/api/community/posts/${post.id}/connection`)
    .set("Cookie", await global.signin(userId))
    .send({})
  expect(response.status).toEqual(200)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
