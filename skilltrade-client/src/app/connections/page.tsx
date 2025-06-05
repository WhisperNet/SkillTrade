"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Check, X, Users, Calendar, Clock, Mail, BookOpen, User } from "lucide-react"
import buildClient from "../../../api/client"
import { useCurrentUser } from "@/contexts/CurrentUserContext"

interface Connection {
  id: string
  postId: string
  postTitle: string
  postAuthorId: string
  requestedUserId: string
  requestedUserName: string
  requestedUserProfilePicture: string
}

export default function ConnectionsPage() {
  const router = useRouter()
  const { currentUser } = useCurrentUser()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    //   if (!currentUser) {
    //     router.push("/users/signin")
    //     return
    //   }
    fetchConnections()
  }, [currentUser, router])

  const fetchConnections = async () => {
    try {
      const client = buildClient({ req: {} })
      const response = await client.get("/api/connections")
      setConnections(response.data || [])
    } catch (error) {
      console.error("Error fetching connections:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (connectionId: string) => {
    setProcessingId(connectionId)
    try {
      const client = buildClient({ req: {} })
      await client.get(`/api/connections/${connectionId}/accept`)

      // Remove the connection from the list
      setConnections(prev => prev.filter(conn => conn.id !== connectionId))

      // Redirect to sessions page
      router.push("/session")
    } catch (error) {
      console.error("Error accepting connection:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (connectionId: string) => {
    setProcessingId(connectionId)
    try {
      const client = buildClient({ req: {} })
      await client.get(`/api/connections/${connectionId}/reject`)

      // Remove the connection from the list immediately
      setConnections(prev => prev.filter(conn => conn.id !== connectionId))
    } catch (error) {
      console.error("Error rejecting connection:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <div className="h-9 w-20 bg-muted rounded"></div>
                  <div className="h-9 w-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/community">Community</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Connection Requests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1>
          <p className="text-muted-foreground mt-2">Manage your incoming skill exchange requests</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {connections.length} pending
        </Badge>
      </div>

      {/* Connection Requests */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Connection Requests</h3>
            <p className="text-muted-foreground text-center mb-6">
              You don't have any pending connection requests at the moment.
            </p>
            <Button asChild>
              <Link href="/community">Browse Community</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map(connection => (
            <Card key={connection.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Link href={`/users/${connection.requestedUserId}`} className="block">
                      <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                        <AvatarImage
                          src={connection.requestedUserProfilePicture}
                          alt={connection.requestedUserName}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/users/${connection.requestedUserId}`}
                          className="font-semibold text-lg hover:text-primary transition-colors"
                        >
                          {connection.requestedUserName}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          Requester
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        wants to connect for skill exchange
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    New
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Interested in your post:</span>
                  </div>
                  <Link
                    href={`/community/${connection.postId}`}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {connection.postTitle}
                  </Link>
                </div>

                <div className="flex justify-end space-x-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === connection.id}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Connection Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this connection request from{" "}
                          <span className="font-semibold">{connection.requestedUserName}</span>?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReject(connection.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Reject Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    size="sm"
                    onClick={() => handleAccept(connection.id)}
                    disabled={processingId === connection.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {processingId === connection.id ? "Processing..." : "Accept"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
