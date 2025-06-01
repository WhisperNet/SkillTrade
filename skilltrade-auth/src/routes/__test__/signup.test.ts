import request from "supertest"
import { app } from "../../app"

const validSignupData = {
  email: "test@test.com",
  password: "test",
  fullName: "test",
  description: "test",
  occupation: "professional",
  availability: ["monday", "wednesday", "friday"],
  gender: "male",
}

it("returns 201 on successful signup", async () => {
  return request(app).post("/api/users/signup").send(validSignupData).expect(201)
})

it("returns 400 with invalid email or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test",
      password: "test",
    })
    .expect(400)
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "t",
    })
    .expect(400)
})

it("returns 400 for missing email or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "",
      password: "test",
    })
    .expect(400)
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "",
    })
    .expect(400)
})

it("returns 400 for invalid availability", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      ...validSignupData,
      availability: ["invalid-day"],
    })
    .expect(400)
})

it("returns 400 for empty availability array", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      ...validSignupData,
      availability: [],
    })
    .expect(400)
})

it("sets a cookie after successful signup", async () => {
  const cookie = await global.signin()
  expect(cookie).toBeDefined()
})

it("Rejects duplicate email", async () => {
  await global.signin()
  await request(app).post("/api/users/signup").send(validSignupData).expect(400)
})
