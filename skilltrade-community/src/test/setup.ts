import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import JWT from "jsonwebtoken"
jest.mock("../nats-wrapper")

declare global {
  var signin: (id?: string, isPremium?: boolean) => Promise<string[]>
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

global.signin = async (id?: string, isPremium?: boolean) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    fullName: userData.fullName,
    isPremium: isPremium || false,
    profilePicture: "test",
    email: userData.email,
  }
  const jwt = JSON.stringify({
    JWT: JWT.sign(payload, process.env.JWT_KEY!),
  })
  const base64Encoded = Buffer.from(jwt).toString("base64")
  return [`session=${base64Encoded}`]
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
  jest.clearAllMocks()
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
