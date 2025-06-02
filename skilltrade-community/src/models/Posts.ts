import mongoose from "mongoose"

interface PostAttrs {
  authorId: string
  authorName: string
  authorProfilePicture: string
  isPremium: boolean
  title: string
  content: string
  availability: Array<
    "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  >
  likes?: string[]
  toTeach: string[]
  toLearn: string[]
}

interface PostDoc extends mongoose.Document {
  authorId: string
  authorName: string
  authorProfilePicture: string
  isPremium: boolean
  title: string
  content: string
  availability: Array<
    "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  >
  likes?: string[]
  toTeach: string[]
  toLearn: string[]
  createdAt: Date
  updatedAt: Date
}

interface PostModel extends mongoose.Model<PostDoc> {
  build(attrs: PostAttrs): Promise<PostDoc>
}

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorProfilePicture: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    availability: {
      type: [String],
      enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
      required: true,
    },
    likes: {
      type: [String],
    },
    toTeach: {
      type: [String],
      required: true,
    },
    toLearn: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

postSchema.statics.build = (attrs: PostAttrs) => {
  return Post.create(attrs)
}

const Post = mongoose.model<PostDoc, PostModel>("Post", postSchema)
export { Post }
