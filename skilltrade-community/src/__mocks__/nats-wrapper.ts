import { Subjects } from "@cse-350/shared-library"

export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation((subject: Subjects, data: string, callback: () => void) => {
        callback()
      }),
  },
}
