"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Users, BookOpen, GraduationCap, Clock, CheckCircle2, XCircle } from "lucide-react"
import buildClient from "../../../api/client"
import { useCurrentUser } from "@/contexts/CurrentUserContext"

interface Session {
  id: string
  sessionTakerOneId: string
  sessionTakerTwoId: string
  sessionTakerOneName: string
  sessionTakerTwoName: string
  sessionTakerOneProfilePicture: string
  sessionTakerTwoProfilePicture: string
  isEnded: boolean
  isReviewedByTakerOne: boolean
  isReviewedByTakerTwo: boolean
  toTeach: string[]
  toLearn: string[]
}

interface SessionCardData {
  sessionId: string
  otherPersonName: string
  otherPersonProfilePicture: string
  teachingSkills: string[]
  learningSkills: string[]
  isEnded: boolean
  isReviewed: boolean
}

export default function SessionPage() {
  const { currentUser, loading } = useCurrentUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionLoading, setSessionLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser) return

      try {
        setSessionLoading(true)
        const client = buildClient({ req: {} })
        const { data } = await client.get("/api/connections/active")
        console.log(data)
        setSessions(data)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        setError("Failed to load sessions")
      } finally {
        setSessionLoading(false)
      }
    }

    if (!loading && currentUser) {
      fetchSessions()
    }
  }, [currentUser, loading])

  // Transform session data based on current user perspective
  const getSessionCardData = (session: Session): SessionCardData => {
    const isCurrentUserTakerOne = currentUser?.id === session.sessionTakerOneId

    if (isCurrentUserTakerOne) {
      // Current user is taker one, show taker two's info
      return {
        sessionId: session.id,
        otherPersonName: session.sessionTakerTwoName,
        otherPersonProfilePicture: session.sessionTakerTwoProfilePicture,
        teachingSkills: session.toTeach,
        learningSkills: session.toLearn,
        isEnded: session.isEnded,
        isReviewed: session.isReviewedByTakerOne,
      }
    } else {
      // Current user is taker two, show taker one's info and swap skills
      return {
        sessionId: session.id,
        otherPersonName: session.sessionTakerOneName,
        otherPersonProfilePicture: session.sessionTakerOneProfilePicture,
        teachingSkills: session.toLearn, // Swapped
        learningSkills: session.toTeach, // Swapped
        isEnded: session.isEnded,
        isReviewed: session.isReviewedByTakerTwo,
      }
    }
  }

  if (loading || sessionLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    router.push("/users/signin")
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Sessions</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">Sessions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Sessions</h1>
          <p className="text-muted-foreground">
            Manage your active and completed learning sessions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {sessions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Active Sessions</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {sessions.filter(s => !s.isEnded).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Completed</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {sessions.filter(s => s.isEnded).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Sessions Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start connecting with other learners to begin your skill exchange journey
          </p>
          <Link href="/connections">
            <Badge
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Browse Connections
            </Badge>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => {
            const cardData = getSessionCardData(session)

            return (
              <Link key={session.id} href={`/session/${session.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 transform hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage
                            src={cardData.otherPersonProfilePicture}
                            alt={cardData.otherPersonName}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {cardData.otherPersonName
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {cardData.otherPersonName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Learning Partner</p>
                        </div>
                      </div>
                      <Badge
                        variant={cardData.isEnded ? "secondary" : "default"}
                        className={`${
                          cardData.isEnded
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        } font-medium`}
                      >
                        {cardData.isEnded ? "Completed" : "Active"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Teaching Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-foreground">You're Teaching</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cardData.teachingSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Learning Skills */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-foreground">You're Learning</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cardData.learningSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Review Status */}
                    {cardData.isEnded && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {cardData.isReviewed ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Reviewed
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-amber-600 dark:text-amber-400">
                                Pending Review
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
