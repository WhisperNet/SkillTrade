import mongoose from "mongoose"

interface SessionAttrs {
  sessionTakerOneId: string
  sessionTakerTwoId: string
  sessionTakerOneName: string
  sessionTakerTwoName: string
  sessionTakerOneProfilePicture: string
  sessionTakerTwoProfilePicture: string
  isEnded?: boolean
  isReviewedByTakerOne?: boolean
  isReviewedByTakerTwo?: boolean
  toTeach: string[]
  toLearn: string[]
  sessionTakerOneTeaching?: number
  sessionTakerTwoTeaching?: number
  nextSessionBeginsAt?: Date
}

interface SessionDoc extends mongoose.Document, SessionAttrs {}

interface SessionModel extends mongoose.Model<SessionDoc> {
  build(attrs: SessionAttrs): Promise<SessionDoc>
}

const sessionSchema = new mongoose.Schema(
  {
    sessionTakerOneId: {
      type: String,
      required: true,
    },
    sessionTakerTwoId: {
      type: String,
      required: true,
    },
    sessionTakerOneName: {
      type: String,
      required: true,
    },
    sessionTakerTwoName: {
      type: String,
      required: true,
    },
    sessionTakerOneProfilePicture: {
      type: String,
      required: true,
    },
    sessionTakerTwoProfilePicture: {
      type: String,
      required: true,
    },
    isEnded: {
      type: Boolean,
      default: false,
    },
    isReviewedByTakerOne: {
      type: Boolean,
      default: false,
    },
    isReviewedByTakerTwo: {
      type: Boolean,
      default: false,
    },
    toTeach: {
      type: [String],
      required: true,
    },
    toLearn: {
      type: [String],
      required: true,
    },
    sessionTakerOneTeaching: {
      type: Number,
      default: 0,
    },
    sessionTakerTwoTeaching: {
      type: Number,
      default: 0,
    },
    nextSessionBeginsAt: {
      type: Date,
      default: null,
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

sessionSchema.statics.build = (attrs: SessionAttrs) => {
  return Session.create(attrs)
}

const Session = mongoose.model<SessionDoc, SessionModel>("Session", sessionSchema)

export { Session }
