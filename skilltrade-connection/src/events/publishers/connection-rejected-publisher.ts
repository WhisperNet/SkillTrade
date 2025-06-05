import { Publisher, Subjects, ConnectionRejectedEvent } from "@cse-350/shared-library"

export class ConnectionRejectedPublisher extends Publisher<ConnectionRejectedEvent> {
  subject: Subjects.ConnectionRejected = Subjects.ConnectionRejected
}
