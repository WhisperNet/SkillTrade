import { Listener, Subjects } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { User } from "../../models/User"
import { ReviewCreatedEvent } from "@cse-350/shared-library"
import { Review } from "../../models/Review"

export class ReviewCreatedListener extends Listener<ReviewCreatedEvent> {
  readonly subject = Subjects.ReviewCreated
  queueGroupName = "skilltrade-auth-service"

  async onMessage(data: ReviewCreatedEvent["data"], msg: Message) {
    const {
      reviewContent,
      reviewRating,
      reviewAuthorId,
      reviewAuthorName,
      reviewAuthorProfilePicture,
      reviewedUserId,
    } = data

    const user = await User.findById(reviewedUserId)
    if (!user) {
      throw new Error("User not found")
    }
    const review = Review.build({
      review: reviewContent,
      rating: reviewRating,
      reviewBy: reviewAuthorId,
      reviewFor: reviewedUserId,
      reviewAuthorName: reviewAuthorName,
      reviewAuthorProfilePicture: reviewAuthorProfilePicture,
    })
    await user.save()
    msg.ack()
  }
}
