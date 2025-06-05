"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftRight, TrendingUp, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import buildClient from "../../../../api/client"

interface Session {
  id: string
  sessionTakerOneId: string
  sessionTakerTwoId: string
  sessionTakerOneName: string
  sessionTakerTwoName: string
  sessionTakerOneProfilePicture: string
  sessionTakerTwoProfilePicture: string
  isEnded: boolean
  sessionTakerOneTeaching: number
  sessionTakerTwoTeaching: number
  nextSessionBeginsAt?: string
  toTeach: string[]
  toLearn: string[]
}

interface CurrentUser {
  id: string
  email: string
  // Add other user properties if needed
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("22:00")
  const [isEndingSession, setIsEndingSession] = useState(false)

  // Chart configuration
  const chartConfig = {
    takerOne: {
      label: session?.sessionTakerOneName || "User 1",
      color: "hsl(20.5 90.2% 48.2%)", // Blue
    },
    takerTwo: {
      label: session?.sessionTakerTwoName || "User 2",
      color: "hsl(0 72.2% 50.6%)", // Purple
    },
  } satisfies ChartConfig

  useEffect(() => {
    fetchSession()
    fetchCurrentUser()
  }, [sessionId])

  useEffect(() => {
    // Don't run timer if session is ended
    if (session?.isEnded) {
      return
    }

    const timer = setInterval(() => {
      if (session?.nextSessionBeginsAt) {
        const now = new Date().getTime()
        const sessionTime = new Date(session.nextSessionBeginsAt).getTime()
        const difference = sessionTime - now

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
          } else if (minutes > 0) {
            setTimeRemaining(`${minutes}m ${seconds}s`)
          } else {
            setTimeRemaining(`${seconds}s`)
          }
        } else {
          setTimeRemaining("Session time has passed")
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [session?.nextSessionBeginsAt, session?.isEnded])

  const fetchCurrentUser = async () => {
    try {
      const client = buildClient({ req: undefined })
      const response = await client.get("/api/users/currentuser")
      setCurrentUser(response.data.currentUser)
    } catch (err: any) {
      console.log("Failed to fetch current user:", err)
    }
  }

  const fetchSession = async () => {
    try {
      const client = buildClient({ req: undefined })
      const response = await client.get(`/api/connections/active/${sessionId}`)
      setSession(response.data)
    } catch (err: any) {
      console.log(err)
      setError(err.response?.data?.message || "Failed to fetch session")
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  const handleSetDateTime = async () => {
    if (!selectedDate) return

    try {
      // Combine date and time
      const dateTimeString = selectedTime
        ? `${selectedDate.toISOString().split("T")[0]}T${selectedTime}:00`
        : selectedDate.toISOString()

      const combinedDateTime = new Date(dateTimeString)

      const client = buildClient({ req: undefined })
      await client.post(`/api/connections/active/${sessionId}/set-date`, {
        date: combinedDateTime.toISOString(),
      })
      setSession(prev =>
        prev ? { ...prev, nextSessionBeginsAt: combinedDateTime.toISOString() } : prev
      )
      setIsCalendarOpen(false)
      setSelectedDate(undefined)
      setSelectedTime("22:00")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set date")
    }
  }

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true)
      const client = buildClient({ req: undefined })
      await client.post(`/api/connections/active/${sessionId}/end`)
      setSession(prev => (prev ? { ...prev, isEnded: true } : prev))
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to end session")
    } finally {
      setIsEndingSession(false)
    }
  }

  // Determine skills to show based on current user perspective
  const getSkillsForCurrentUser = () => {
    if (!session || !currentUser) {
      return { skillsToTeach: [], skillsToLearn: [] }
    }

    if (currentUser.id === session.sessionTakerOneId) {
      // Current user is taker one - show original mapping
      return {
        skillsToTeach: session.toTeach,
        skillsToLearn: session.toLearn,
      }
    } else if (currentUser.id === session.sessionTakerTwoId) {
      // Current user is taker two - swap the skills
      return {
        skillsToTeach: session.toLearn,
        skillsToLearn: session.toTeach,
      }
    } else {
      return { skillsToTeach: [], skillsToLearn: [] }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading session...</div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error || "Session not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const chartData = [
    {
      month: "sessions",
      takerOne: session.sessionTakerOneTeaching,
      takerTwo: session.sessionTakerTwoTeaching,
    },
  ]

  const totalHours = session.sessionTakerOneTeaching + session.sessionTakerTwoTeaching
  const { skillsToTeach, skillsToLearn } = getSkillsForCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Profile Pictures */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Active Session</CardTitle>
          {session.isEnded && (
            <Badge variant="destructive" className="mx-auto w-fit">
              Session Ended
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            {/* User 1 */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage
                  src={session.sessionTakerOneProfilePicture}
                  alt={session.sessionTakerOneName}
                />
                <AvatarFallback>{session.sessionTakerOneName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="link"
                className="text-lg font-semibold p-0 h-auto"
                onClick={() => handleUserClick(session.sessionTakerOneId)}
              >
                {session.sessionTakerOneName}
              </Button>
            </div>

            {/* Trade Icon */}
            <div className="flex flex-col items-center space-y-2">
              <ArrowLeftRight className="h-8 w-8 text-primary" />
              <span className="text-sm text-muted-foreground">Skill Trade</span>
            </div>

            {/* User 2 */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage
                  src={session.sessionTakerTwoProfilePicture}
                  alt={session.sessionTakerTwoName}
                />
                <AvatarFallback>{session.sessionTakerTwoName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="link"
                className="text-lg font-semibold p-0 h-auto"
                onClick={() => handleUserClick(session.sessionTakerTwoId)}
              >
                {session.sessionTakerTwoName}
              </Button>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Skills to Teach</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {skillsToTeach.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Skills to Learn</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {skillsToLearn.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Session Timer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {session.isEnded ? "Last Session" : "Next Session"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {session.nextSessionBeginsAt ? (
                <div>
                  {session.isEnded ? (
                    <div>
                      <div className="text-lg text-muted-foreground">
                        Last scheduled session was
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {new Date(session.nextSessionBeginsAt).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-primary">{timeRemaining}</div>
                      <div className="text-sm text-muted-foreground">
                        Scheduled for {new Date(session.nextSessionBeginsAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-lg text-muted-foreground">
                  {session.isEnded ? "No session was scheduled" : "No time is set"}
                </div>
              )}

              {!session.isEnded && (
                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {session.nextSessionBeginsAt ? "Change Time" : "Set Time"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Set Next Session Date & Time</DialogTitle>
                      <DialogDescription>
                        Choose when your next session should begin.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date: Date) => date < new Date()}
                          className="rounded-md border shadow-sm"
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button:
                              "h-7 w-7 bg-muted/10 hover:bg-muted/20 p-0 text-foreground/70 hover:text-foreground border border-border/50 hover:border-border rounded-md transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell:
                              "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-8 w-8 text-center text-sm relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            day_range_end: "day-range-end",
                            day_selected:
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground font-semibold",
                            day_outside:
                              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle:
                              "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="time" className="text-sm font-medium">
                          Time (optional)
                        </label>
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          className="w-full"
                          placeholder="Select time"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={!selectedDate} onClick={handleSetDateTime}>
                        Set Date & Time
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session Hours</CardTitle>
            <CardDescription>Hours taught by each participant</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[250px]"
            >
              <RadialBarChart data={chartData} endAngle={180} innerRadius={80} outerRadius={130}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {totalHours}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              Total Hours
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="takerOne"
                  stackId="a"
                  cornerRadius={5}
                  fill="hsl(20.5 90.2% 48.2%)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="takerTwo"
                  fill="hsl(0 72.2% 50.6%)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(20.5 90.2% 48.2%)" }}
                ></div>
                <span>
                  {session.sessionTakerOneName}: {session.sessionTakerOneTeaching}h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(0 72.2% 50.6%)" }}
                ></div>
                <span>
                  {session.sessionTakerTwoName}: {session.sessionTakerTwoTeaching}h
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* End Session Button */}
      <div className="mt-6 text-center">
        <Button
          variant="destructive"
          disabled={session.isEnded || isEndingSession}
          onClick={handleEndSession}
          className="w-full max-w-sm"
        >
          {isEndingSession
            ? "Ending Session..."
            : session.isEnded
            ? "Session Ended"
            : "End Session"}
        </Button>
      </div>

      {error && (
        <Alert className="mt-4 max-w-md mx-auto" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
