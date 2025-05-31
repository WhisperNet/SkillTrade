import request from "supertest"
import { app } from "../../app"

it("returns details about the current signin user", async () => {
  const reqCookie = await global.signin()

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", reqCookie)
    .send({})
    .expect(200)
  expect(response.body.currentUser.email).toEqual("test@test.com")
  expect(response.body.currentUser.fullName).toEqual("test")
  expect(response.body.currentUser.profilePicture).toBeDefined()
  expect(response.body.currentUser.isPremium).toBeDefined()
})

it("returns null if not signed in", async () => {
  const response = await request(app).get("/api/users/currentuser").send().expect(200)
  expect(response.body.currentUser).toEqual(null)
})
