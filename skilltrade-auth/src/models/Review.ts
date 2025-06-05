import mongoose from "mongoose"

interface UserReviewAttrs {
  review: string
  rating: number
  reviewBy: string
  reviewFor: string
  reviewAuthorName: string
  reviewAuthorProfilePicture: string
}

interface UserReviewDoc extends mongoose.Document {
  review: string
  rating: number
  reviewBy: string
  reviewFor: string
  reviewAuthorName: string
  reviewAuthorProfilePicture: string
}

interface UserReviewModel extends mongoose.Model<UserReviewDoc> {
  build(attrs: UserReviewAttrs): Promise<UserReviewDoc>
}

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  reviewBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewAuthorName: {
    type: String,
    required: true,
  },
  reviewAuthorProfilePicture: {
    type: String,
    required: true,
  },
})

reviewSchema.statics.build = (attrs: UserReviewAttrs) => {
  return Review.create(attrs)
}

const Review = mongoose.model<UserReviewDoc, UserReviewModel>("Review", reviewSchema)
export { Review }
