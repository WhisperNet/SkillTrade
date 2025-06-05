import mongoose from "mongoose"

interface ConnectionAttrs {
  postId: string
  postTitle: string
  postAuthorId: string
  requestedUserId: string
  requestedUserName: string
  requestedUserProfilePicture: string
  toTeach: string[]
  toLearn: string[]
}

interface ConnectionDoc extends mongoose.Document, ConnectionAttrs {}

interface ConnectionModel extends mongoose.Model<ConnectionDoc> {
  build(attrs: ConnectionAttrs): Promise<ConnectionDoc>
}

const connectionSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },
    postAuthorId: {
      type: String,
      required: true,
    },
    requestedUserId: {
      type: String,
      required: true,
    },
    requestedUserName: {
      type: String,
      required: true,
    },
    requestedUserProfilePicture: {
      type: String,
      required: true,
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
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

connectionSchema.statics.build = function (attrs: ConnectionAttrs) {
  return this.create(attrs)
}

const Connection = mongoose.model<ConnectionDoc, ConnectionModel>("Connection", connectionSchema)

export { Connection }
