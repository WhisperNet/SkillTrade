import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import request from "supertest"
import { app } from "../app"
import { User } from "../models/User"
import JWT from "jsonwebtoken"

declare global {
  var signin: (id?: string) => Promise<string[]>
}
const userData = {
  email: "test@test.com",
  password: "test",
  fullName: "test",
  description: "test",
  occupation: "professional",
  availability: ["monday", "wednesday", "friday"],
  gender: "male",
}
global.signin = async (id?: string) => {
  if (id) {
    const user = await User.create({
      _id: id,
      ...userData,
    })
    const response = await request(app).post("/api/users/signin").send({
      email: userData.email,
      password: userData.password,
    })
    const cookie = response.get("Set-Cookie")
    if (!cookie) throw new Error("Failed to get cookie")
    return cookie
  }

  const response = await request(app).post("/api/users/signup").send(userData).expect(201)
  const cookie = response.get("Set-Cookie")

  if (!cookie) throw new Error("Failed to get cookie")
  return cookie
}

let mongodb: any
beforeAll(async () => {
  process.env.JWT_KEY = "test_environemnt_key"
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  mongodb = await MongoMemoryServer.create()
  const mongoUri = mongodb.getUri()
  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections()
    for (let collection of collections) {
      await collection.deleteMany({})
    }
  }
})

afterAll(async () => {
  if (mongodb) await mongodb.stop()
  await mongoose.connection.close()
})
