import mongoose from "mongoose"
import { Post } from "../../models/Posts"
import { app } from "../../app"
import request from "supertest"

const createPost = async (toLearn: string[], toTeach: string[]) => {
  const post = await Post.build({
    title: "Test Post",
    content: "Test Content",
    toTeach,
    toLearn,
    authorId: new mongoose.Types.ObjectId().toHexString(),
    authorName: "Test Author",
    authorProfilePicture: "Test Profile Picture",
    isPremium: false,
    availability: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
  })
  await post.save()
  return post
}

it("returns all posts when no toLearn or toTeach is provided", async () => {
  const post = await createPost(["javascript"], ["python"])
  const response = await request(app)
    .post("/api/community/search")
    .send({ toLearn: [], toTeach: [] })
  expect(response.status).toEqual(200)
  expect(response.body).toHaveLength(1)
})

it("returns posts when toLearn is provided", async () => {
  const post = await createPost(["javascript"], ["python"])
  await createPost(["python"], ["javascript"])
  await createPost(["python"], ["react"])
  await createPost(["python"], ["nodejs"])
  const response = await request(app)
    .post("/api/community/search")
    .send({ toLearn: ["javascript"], toTeach: [] })
  expect(response.status).toEqual(200)
  expect(response.body).toHaveLength(1)
  expect(response.body[0].toLearn).toEqual(["javascript"])
})

it("returns posts when toTeach is provided", async () => {
  await createPost(["javascript"], ["python"])
  await createPost(["python"], ["javascript"])
  await createPost(["python"], ["react"])
  await createPost(["python"], ["nodejs"])
  const response = await request(app)
    .post("/api/community/search")
    .send({ toTeach: ["python"], toLearn: [] })
  expect(response.status).toEqual(200)
  expect(response.body).toHaveLength(1)
  expect(response.body[0].toTeach).toEqual(["python"])
})

it("returns posts when both toLearn and toTeach are provided", async () => {
  await createPost(["javascript"], ["python"])
  await createPost(["python"], ["javascript"])
  await createPost(["python"], ["react"])
  await createPost(["python"], ["nodejs"])
  await createPost(["javascript"], ["react"])
  const response = await request(app)
    .post("/api/community/search")
    .send({ toLearn: ["javascript"], toTeach: ["python"] })
  expect(response.status).toEqual(200)
  expect(response.body).toHaveLength(1)
})
