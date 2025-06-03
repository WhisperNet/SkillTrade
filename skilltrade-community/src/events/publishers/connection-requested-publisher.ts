import { Publisher, Subjects, ConnectionRequestedEvent } from "@cse-350/shared-library"

export class ConnectionRequestedPublisher extends Publisher<ConnectionRequestedEvent> {
  subject: Subjects.ConnectionRequested = Subjects.ConnectionRequested
}
