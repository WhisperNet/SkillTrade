"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import {
  HeartHandshake,
  Edit,
  Trash2,
  Crown,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  User,
} from "lucide-react"
import buildClient from "../../../../api/client"
import { useCurrentUser } from "@/contexts/CurrentUserContext"
import EditPostSheet from "@/components/EditPostSheet"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

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

export default function CommunityPage() {
  const { id } = useParams()
  const router = useRouter()
  const { currentUser } = useCurrentUser()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const fetchPost = async () => {
    try {
      const client = buildClient({ req: {} })
      const response = await client.get(`/api/community/posts/${id}`)
      setPost(response.data)
    } catch (error) {
      console.error("Error fetching post:", error)
      // Redirect to community if post not found
      router.push("/community")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const handleLike = async () => {
    if (!currentUser || isLiking) return

    setIsLiking(true)
    try {
      const client = buildClient({ req: {} })
      await client.post(`/api/community/posts/${id}/like`)

      // Update the local state
      setPost(prevPost => {
        if (!prevPost) return null

        const currentLikes = prevPost.likes || []
        const isCurrentlyLiked = currentLikes.includes(currentUser.id)

        return {
          ...prevPost,
          likes: isCurrentlyLiked
            ? currentLikes.filter(userId => userId !== currentUser.id)
            : [...currentLikes, currentUser.id],
        }
      })
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUser || isDeleting) return

    setIsDeleting(true)
    try {
      const client = buildClient({ req: {} })
      await client.post(`/api/community/posts/${id}/delete`)
      router.push("/community")
    } catch (error) {
      console.error("Error deleting post:", error)
      setIsDeleting(false)
    }
  }

  const handlePostUpdated = (updatedPost: Post) => {
    setPost(updatedPost)
    setEditSheetOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => router.push("/community")}>Back to Community</Button>
        </div>
      </div>
    )
  }

  const isAuthor = currentUser?.id === post.authorId
  const isLiked = currentUser && post.likes?.includes(currentUser.id)
  const likeCount = post.likes?.length || 0
  const canEdit = isAuthor && currentUser?.isPremium

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            {/* Author Info and Actions */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.authorProfilePicture} alt={post.authorName} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/${post.authorId}`} className="hover:underline">
                      <h3 className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors">
                        {post.authorName}
                      </h3>
                    </Link>
                    {post.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.updatedAt !== post.createdAt && <span className="text-xs">(edited)</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Like Button */}
                {currentUser && !isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center space-x-1 ${
                      isLiked
                        ? "text-orange-500 hover:text-orange-600"
                        : "text-muted-foreground hover:text-orange-500"
                    }`}
                  >
                    <HeartHandshake className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </Button>
                )}

                {/* Edit/Delete Buttons for Author */}
                {isAuthor && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!canEdit}
                                className={!canEdit ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </SheetTrigger>
                            {canEdit && (
                              <EditPostSheet
                                post={post}
                                onPostUpdated={handlePostUpdated}
                                onClose={() => setEditSheetOpen(false)}
                              />
                            )}
                          </Sheet>
                        </div>
                      </TooltipTrigger>
                      {!canEdit && (
                        <TooltipContent>
                          <p>Only premium users can edit posts</p>
                        </TooltipContent>
                      )}
                    </Tooltip>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            {/* Post Title */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{post.title}</h1>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Post Content */}
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            <Separator />

            {/* Skills Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills to Teach */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Can Teach</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.toTeach.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-lg">Wants to Learn</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.toLearn.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-lg">Availability</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.availability.map((day, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="capitalize border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Like Count Display */}
            {likeCount > 0 && (
              <>
                <Separator />
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <HeartHandshake className="h-4 w-4 text-orange-500" />
                  <span>
                    {likeCount} {likeCount === 1 ? "person likes" : "people like"} this post
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back to Community Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push("/community")}>
            Back to Community
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
