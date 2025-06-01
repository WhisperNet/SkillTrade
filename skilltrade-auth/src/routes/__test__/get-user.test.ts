import { app } from "../../app"
import request from "supertest"
import mongoose from "mongoose"
import { Review } from "../../models/Review"
import { User } from "../../models/User"

const startUp = async () => {
  const user1Id = new mongoose.Types.ObjectId()
  const user2Id = new mongoose.Types.ObjectId()

  const user1 = await User.create({
    _id: user1Id,
    email: "test@test.com",
    password: "test",
    fullName: "test",
    description: "test",
    occupation: "professional",
    availability: ["monday", "wednesday", "friday"],
    gender: "male",
    sessionsTaught: 10,
    isPremium: true,
    profilePicture: "https://avatar.iran.liara.run/public/1",
  })
  const review1 = await Review.build({
    review: "This is first review",
    rating: 5,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })

  const review2 = await Review.build({
    review: "This is second review",
    rating: 4,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })

  const review3 = await Review.build({
    review: "This is third review",
    rating: 3,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })
  const review4 = await Review.build({
    review: "This is fourth review",
    rating: 5,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })
  const review5 = await Review.build({
    review: "This is fifth review",
    rating: 5,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })
  const review6 = await Review.build({
    review: "This is sixth review",
    rating: 5,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })
  const review7 = await Review.build({
    review: "This is seventh review",
    rating: 5,
    reviewFor: user1Id.toString(),
    reviewBy: user2Id.toString(),
  })
  return { user1Id, user2Id, review1, review2, review3, review4, review5, review6, review7 }
}

it("should return 404 if user not found", async () => {
  const response = await request(app).get(
    `/api/users/${new mongoose.Types.ObjectId().toHexString()}`
  )
  expect(response.status).toBe(404)
})

it("should return user details (Featured User)", async () => {
  const { user1Id } = await startUp()
  const response = await request(app).get(`/api/users/${user1Id}`)
  expect(response.status).toBe(200)
  expect(response.body.id).toBe(user1Id.toString())
  expect(response.body.avgRating).toBe(4.571428571428571)
  expect(response.body.is5Star).toBe(true)
  expect(response.body.isExperiencedTeacher).toBe(true)
  expect(response.body.isPremium).toBe(true)
})

it("should return user details (Not Featured User)", async () => {
  const { body } = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test",
      fullName: "test",
      description: "test",
      occupation: "professional",
      availability: ["monday", "wednesday"],
      gender: "male",
    })

  const response = await request(app).get(`/api/users/${body.currentUser.id}`)

  expect(response.status).toBe(200)
  expect(response.body.id).toBe(body.currentUser.id)
  expect(response.body.avgRating).toBe(0)
  expect(response.body.is5Star).toBe(false)
  expect(response.body.isExperiencedTeacher).toBe(false)
  expect(response.body.isPremium).toBe(false)
})
