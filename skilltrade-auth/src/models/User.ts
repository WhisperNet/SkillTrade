import mongoose from "mongoose"
import { Password } from "../services/password"
// properties needed for createing user
interface UserAttrs {
  email: string
  password: string
  profilePicture: string
  fullName: string
  description: string
  occupation: "professional" | "student" | "freelancer" | "entrepreneur" | "other"
  availability: Array<
    "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  >
  gender: "male" | "female" | "other"
  sessionsTaught?: number
  isPremium?: boolean
  review?: string
}
//properties a user documents have
interface UserDoc extends mongoose.Document {
  email: string
  password: string
  profilePicture: string
  fullName: string
  description: string
  occupation: "professional" | "student" | "freelancer" | "entrepreneur" | "other"
  availability: Array<
    "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  >
  gender: "male" | "female" | "other"
  sessionsTaught?: number
  isPremium?: boolean
  review?: string
}
//properties a user model have
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): Promise<UserDoc>
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    profilePicture: {
      type: String,
      require: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    occupation: {
      type: String,
      enum: ["professional", "student", "freelancer", "entrepreneur", "other"],
      require: true,
    },
    availability: {
      type: [String],
      enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
      require: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      require: true,
    },
    sessionsTaught: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password") as string)
    this.set("password", hashed)
  }
  done()
})
userSchema.statics.build = async (attrs: UserAttrs) => {
  return User.create(attrs)
}
const User = mongoose.model<UserDoc, UserModel>("User", userSchema)

export { User }
