"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import buildClient from "../../../../api/client"
import { useCurrentUser } from "@/contexts/CurrentUserContext"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(20, "Password must be at most 20 characters"),
  fullName: z.string().min(1, "Full name is required"),
  description: z.string().min(1, "Description is required"),
  occupation: z.enum(["student", "professional", "freelancer", "entrepreneur", "other"]),
  availability: z
    .array(z.enum(["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]))
    .min(1, "Select at least one day"),
  gender: z.enum(["male", "female"]),
})

const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"] as const

export default function Signup() {
  const router = useRouter()
  const { currentUser, setCurrentUser } = useCurrentUser()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      description: "",
      occupation: "student",
      availability: [],
      gender: "male",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const client = buildClient({ req: {} })
      const { data } = await client.post("/api/users/signup", values)
      setCurrentUser(data.currentUser)
      router.push("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mt-7 flex items-center justify-center  transition-colors">
      <Card className="w-full max-w-3xl mx-4 shadow-lg p-8 mt-12">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join SkillTrade to start trading your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your occupation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {days.map(day => (
                        <label key={day} className="flex items-center gap-1 text-sm capitalize">
                          <input
                            type="checkbox"
                            value={day}
                            checked={field.value?.includes(day)}
                            onChange={e => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), day])
                              } else {
                                field.onChange(
                                  (field.value || []).filter(
                                    (d: (typeof days)[number]) => d !== day
                                  )
                                )
                              }
                            }}
                            className="accent-primary h-4 w-4 rounded border border-input bg-background"
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button type="submit" className="w-1/2 mx-auto mt-4">
                  Sign Up
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
