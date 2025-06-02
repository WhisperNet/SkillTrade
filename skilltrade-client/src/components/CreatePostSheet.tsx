"use client"

import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import buildClient from "../../api/client"

const validDays = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters!" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters!" }),
  toTeach: z.string().min(1, { message: "Please specify skills you can teach!" }),
  toLearn: z.string().min(1, { message: "Please specify skills you want to learn!" }),
  availability: z.array(z.string()).min(1, { message: "Select at least one day!" }),
})

interface Post {
  id: string
  authorId: string
  authorName: string
  authorProfilePicture: string
  isPremium: boolean
  title: string
  content: string
  availability: string[]
  likes?: string[]
  toTeach: string[]
  toLearn: string[]
  createdAt: string
  updatedAt: string
}

interface CreatePostSheetProps {
  onPostCreated?: (post: Post) => void
}

const CreatePostSheet = ({ onPostCreated }: CreatePostSheetProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      toTeach: "",
      toLearn: "",
      availability: [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      // Convert comma-separated strings to arrays
      const toTeachArray = values.toTeach
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      const toLearnArray = values.toLearn
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      const postData = {
        title: values.title,
        content: values.content,
        toTeach: toTeachArray,
        toLearn: toLearnArray,
        availability: values.availability,
      }

      const client = buildClient({ req: {} })
      const response = await client.post("/api/community/posts", postData)

      if (onPostCreated) {
        onPostCreated(response.data)
      }

      // Reset form
      form.reset()
    } catch (error) {
      console.error("Error creating post:", error)
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
      <SheetHeader className="flex-shrink-0 px-6 py-6 border-b">
        <SheetTitle>Create New Post</SheetTitle>
        <SheetDescription>
          Share your skills and connect with the community. Fill in the details below.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your post a catchy title..." {...field} />
                    </FormControl>
                    <FormDescription>A clear, descriptive title for your post.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you're looking for, your experience level, goals, or any other relevant details..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell the community about yourself and what you're looking for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toTeach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills I Can Teach</FormLabel>
                    <FormControl>
                      <Input placeholder="JavaScript, Guitar, Cooking, Photography..." {...field} />
                    </FormControl>
                    <FormDescription>Enter skills separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toLearn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills I Want to Learn</FormLabel>
                    <FormControl>
                      <Input placeholder="Python, Piano, Design, Marketing..." {...field} />
                    </FormControl>
                    <FormDescription>Enter skills separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Availability</FormLabel>
                      <FormDescription>
                        Select the days you're available for skill exchange sessions.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {validDays.map(day => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="availability"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked: boolean) => {
                                      return checked
                                        ? field.onChange([...field.value, day])
                                        : field.onChange(
                                            field.value?.filter(value => value !== day)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fixed submit button at bottom */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Post..." : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SheetContent>
  )
}

export default CreatePostSheet
