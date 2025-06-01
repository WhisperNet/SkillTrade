import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"

describe("Update User Route", () => {
  const validUpdateData = {
    fullName: "Updated Name",
    description: "Updated description",
    occupation: "student",
    availability: ["monday", "wednesday", "friday"],
    password: "password",
  }

  it("returns a 401 if the user is not authenticated", async () => {
    await request(app).post("/api/users/update").send({}).expect(401)
  })

  it("returns 400 for incomplete data", async () => {
    const reqCookie = await global.signin(new mongoose.Types.ObjectId().toHexString())
    await request(app).post("/api/users/update").set("Cookie", reqCookie).send({}).expect(400)
  })
  it("returns 400 for invalid occupation", async () => {
    const reqCookie = await global.signin()
    await request(app)
      .post("/api/users/update")
      .set("Cookie", reqCookie)
      .send({
        ...validUpdateData,
        occupation: "invalid-occupation",
      })
      .expect(400)
  })
  it("returns 400 for invalid availability", async () => {
    const reqCookie = await global.signin()
    await request(app)
      .post("/api/users/update")
      .set("Cookie", reqCookie)
      .send({
        ...validUpdateData,
        availability: ["invalid-day"],
      })
      .expect(400)
  })

  it("returns 400 for empty availability array", async () => {
    const reqCookie = await global.signin()
    await request(app)
      .post("/api/users/update")
      .set("Cookie", reqCookie)
      .send({
        ...validUpdateData,
        availability: [],
      })
      .expect(400)
  })

  it("successfully updates user data", async () => {
    const reqCookie = await global.signin()
    const response = await request(app)
      .post("/api/users/update")
      .set("Cookie", reqCookie)
      .send(validUpdateData)
      .expect(200)
    expect(response.body.currentUser.fullName).toEqual(validUpdateData.fullName)
    expect(response.body.currentUser.description).toEqual(validUpdateData.description)
    expect(response.body.currentUser.occupation).toEqual(validUpdateData.occupation)
    expect(response.body.currentUser.availability).toEqual(validUpdateData.availability)
  })
})
