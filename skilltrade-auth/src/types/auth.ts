export enum Occupation {
  STUDENT = "student",
  PROFESSIONAL = "professional",
  FREELANCER = "freelancer",
  ENTREPRENEUR = "entrepreneur",
  OTHER = "other",
}

export enum Availability {
  SATURDAY = "saturday",
  SUNDAY = "sunday",
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

// Type guard functions to check if a value is valid for each enum
export const isValidOccupation = (value: string): value is Occupation => {
  return Object.values(Occupation).includes(value as Occupation)
}

export const isValidAvailability = (value: string): value is Availability => {
  return Object.values(Availability).includes(value as Availability)
}

export const isValidGender = (value: string): value is Gender => {
  return Object.values(Gender).includes(value as Gender)
}
