import mongoose from "mongoose"
import { Review } from "../../models/Review"
import { app } from "../../app"
import request from "supertest"

const startUp = async () => {
  const userId1 = new mongoose.Types.ObjectId()
  const user2 = new mongoose.Types.ObjectId()

  const review1 = await Review.build({
    review: "This is first review",
    rating: 5,
    reviewFor: userId1.toString(),
    reviewBy: user2.toString(),
  })

  const review2 = await Review.build({
    review: "This is second review",
    rating: 4,
    reviewFor: userId1.toString(),
    reviewBy: user2.toString(),
  })
  return { userId1, user2, review1, review2 }
}

it("should return all reviews for a user", async () => {
  const { userId1, user2, review1, review2 } = await startUp()
  const response = await request(app).get(`/api/users/${userId1}/reviews`).expect(200)
  expect(response.body.length).toBe(2)
  expect(response.body[0].review).toBe(review1.review)
  expect(response.body[0].rating).toBe(review1.rating)
  expect(response.body[1].review).toBe(review2.review)
  expect(response.body[1].rating).toBe(review2.rating)
})
