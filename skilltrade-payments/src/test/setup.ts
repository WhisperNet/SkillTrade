import { MongoMemoryServer } from "mongodb-memory-server"
import jsonweb from "jsonwebtoken"
import mongoose from "mongoose"
jest.mock("../nats-wrapper")
declare global {
  var signin: (userId?: string) => string[]
}
global.signin = (userId?: string) => {
  const payload = {
    id: userId || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  }
  const jwt = JSON.stringify({
    JWT: jsonweb.sign(payload, process.env.JWT_KEY!),
  })
  const base64Encoded = Buffer.from(jwt).toString("base64")
  return [`session=${base64Encoded}`]
}
process.env.STRIPE_KEY =
  "sk_test_51RSZPALzm8wwEfGLf26QEb1HpAXoNA53Uakd2P2Z9HumEsmTVt3iuqz13jnaxXGPxevw3mafEgnfaDnclPYNVht300po704HJz"
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
