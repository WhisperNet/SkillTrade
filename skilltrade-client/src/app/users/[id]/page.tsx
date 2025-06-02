"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import CardList from "@/components/CardList"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Crown, Star, Shield, Trophy, User, Award } from "lucide-react"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import EditUser from "@/components/EditUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import RatingBarChart from "@/components/RatingBarChart"

interface User {
  id: string
  email: string
  profilePicture: string
  fullName: string
  description: string
  occupation: "professional" | "student" | "freelancer" | "entrepreneur" | "other"
  availability: string[]
  gender: "male" | "female" | "other"
  sessionsTaught: number
  isPremium: boolean
  avgRating: number
  is5Star: boolean
  isExperiencedTeacher: boolean
}

interface Review {
  id: string
  review: string
  rating: number
  reviewBy: {
    id: string
    fullName: string
    profilePicture: string
  }
  createdAt: string
}

const SingleUserPage = () => {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    // Fetch current user
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/api/users/currentuser")
        setCurrentUserId(response.data.currentUser?.id || null)
      } catch (error) {
        setCurrentUserId(null)
      }
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`)
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/reviews`)
        // Mock populate reviewBy data since the API doesn't return it
        const mockReviews = response.data.map((review: any, index: number) => ({
          ...review,
          id: review._id || `review-${index}`,
          reviewBy: {
            id: `user-${index}`,
            fullName: `User ${index + 1}`,
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
          },
        }))
        setReviews(mockReviews)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
      fetchReviews()
    }
  }, [userId])

  const handleEditUser = async (data: any) => {
    try {
      await axios.post("/api/users/update", data)
      // Refresh user data
      const response = await axios.get(`/api/users/${userId}`)
      setUser(response.data)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const renderBadges = () => {
    const badges = []

    if (user?.isPremium) {
      badges.push(
        <HoverCard key="premium">
          <HoverCardTrigger>
            <Crown
              size={36}
              className="rounded-full bg-yellow-500/30 border-1 border-yellow-500/50 p-2 cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent>
            <h1 className="font-bold mb-2">Premium User</h1>
            <p className="text-sm text-muted-foreground">
              This user has premium access with exclusive features.
            </p>
          </HoverCardContent>
        </HoverCard>
      )
    }

    if (user?.is5Star) {
      badges.push(
        <HoverCard key="rising-star">
          <HoverCardTrigger>
            <Trophy
              size={36}
              className="rounded-full bg-purple-500/30 border-1 border-purple-500/50 p-2 cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent>
            <h1 className="font-bold mb-2">Rising Star</h1>
            <p className="text-sm text-muted-foreground">
              This user has received 5 or more 5-star reviews.
            </p>
          </HoverCardContent>
        </HoverCard>
      )
    }

    if (user?.isExperiencedTeacher) {
      badges.push(
        <HoverCard key="experienced">
          <HoverCardTrigger>
            <Award
              size={36}
              className="rounded-full bg-blue-500/30 border-1 border-blue-500/50 p-2 cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent>
            <h1 className="font-bold mb-2">Experienced Teacher</h1>
            <p className="text-sm text-muted-foreground">
              This user has taught 10 or more sessions.
            </p>
          </HoverCardContent>
        </HoverCard>
      )
    }

    // If no badges, show new user badge
    if (badges.length === 0) {
      badges.push(
        <HoverCard key="new-user">
          <HoverCardTrigger>
            <User
              size={36}
              className="rounded-full bg-green-500/30 border-1 border-green-500/50 p-2 cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent>
            <h1 className="font-bold mb-2">New User</h1>
            <p className="text-sm text-muted-foreground">
              Welcome! This user is new to our platform.
            </p>
          </HoverCardContent>
        </HoverCard>
      )
    }

    return badges
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">Users</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">{user.fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* USER BADGES CONTAINER */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <h1 className="text-xl font-semibold text-primary">User Badges</h1>
            <div className="flex gap-4 mt-4 flex-wrap">{renderBadges()}</div>
          </div>

          {/* INFORMATION CONTAINER */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-primary">User Information</h1>
              {currentUserId === userId && (
                <Sheet open={editOpen} onOpenChange={setEditOpen}>
                  <SheetTrigger asChild>
                    <Button>Edit Profile</Button>
                  </SheetTrigger>
                  <EditUser
                    user={user}
                    onSave={handleEditUser}
                    onSaveSuccess={() => setEditOpen(false)}
                  />
                </Sheet>
              )}
            </div>
            <div className="space-y-4 mt-4 text-card-foreground">
              <div className="flex items-center gap-2">
                <span className="font-bold">Full Name:</span>
                <span>{user.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Occupation:</span>
                <Badge className="capitalize" variant="secondary">
                  {user.occupation}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">Availability:</span>
                <div className="flex flex-wrap gap-1">
                  {user.availability.map(day => (
                    <Badge key={day} variant="outline" className="capitalize">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Sessions Taught:</span>
                <span>{user.sessionsTaught}</span>
              </div>
            </div>
          </div>

          {/* RECENT REVIEWS CONTAINER */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <CardList
              title="Recent Reviews"
              reviews={reviews}
              loading={reviewsLoading}
              cardClassName="bg-muted"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-2/3 space-y-6">
          {/* USER CARD CONTAINER */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold mb-2 text-primary">{user.fullName}</h1>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">{renderStars(user.avgRating)}</div>
                  <span className="text-sm text-muted-foreground">
                    ({user.avgRating.toFixed(1)} average • {reviews.length} reviews)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{user.description}</p>
              </div>
            </div>
          </div>

          {/* RATING DISTRIBUTION CONTAINER */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <h1 className="text-xl font-semibold mb-4 text-primary">Rating Distribution</h1>
            <RatingBarChart reviews={reviews} loading={reviewsLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleUserPage
