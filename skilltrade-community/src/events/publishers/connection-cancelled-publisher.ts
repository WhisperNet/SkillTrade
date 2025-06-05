import { Publisher, Subjects, ConnectionCancelledEvent } from "@cse-350/shared-library"

export class ConnectionCancelledPublisher extends Publisher<ConnectionCancelledEvent> {
  subject: Subjects.ConnectionCancelled = Subjects.ConnectionCancelled
}
