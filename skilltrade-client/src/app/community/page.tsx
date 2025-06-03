"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Search, Plus, Calendar, User, BookOpen, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import buildClient from "../../../api/client"
import CreatePostSheet from "../../components/CreatePostSheet"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLearn, setSearchLearn] = useState("")
  const [searchTeach, setSearchTeach] = useState("")
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const client = buildClient({ req: {} })
      const response = await client.get("/api/community/posts")
      // Sort posts by number of likes (most liked first)
      const sortedPosts = response.data.sort((a: Post, b: Post) => {
        const likesA = a.likes?.length || 0
        const likesB = b.likes?.length || 0
        return likesB - likesA
      })
      setPosts(sortedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Search handler
  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const client = buildClient({ req: {} })
      const searchData = {
        toLearn: searchLearn ? searchLearn.split(",").map(skill => skill.trim()) : [],
        toTeach: searchTeach ? searchTeach.split(",").map(skill => skill.trim()) : [],
      }

      const response = await client.post("/api/community/search", searchData)
      // Sort search results by likes
      const sortedPosts = response.data.sort((a: Post, b: Post) => {
        const likesA = a.likes?.length || 0
        const likesB = b.likes?.length || 0
        return likesB - likesA
      })
      setPosts(sortedPosts)
    } catch (error) {
      console.error("Error searching posts:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setSearchLearn("")
    setSearchTeach("")
    fetchPosts()
  }

  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`)
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
    setIsCreateSheetOpen(false)
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Connect and learn from fellow skill traders</p>
        </div>

        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Post
            </Button>
          </SheetTrigger>
          <CreatePostSheet onPostCreated={handlePostCreated} />
        </Sheet>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills you want to learn</label>
              <Input
                placeholder="e.g., JavaScript, Piano, Cooking..."
                value={searchLearn}
                onChange={e => setSearchLearn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills you want to teach</label>
              <Input
                placeholder="e.g., Python, Guitar, Photography..."
                value={searchTeach}
                onChange={e => setSearchTeach(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isSearching}>
              Reset
            </Button>
            <Button onClick={handleSearch} className="w-full sm:w-auto" disabled={isSearching}>
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </div>
              ) : (
                "Search Posts"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Card
            key={post.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
              post.isPremium && "border-orange-200 shadow-orange-100/50"
            )}
            onClick={() => handlePostClick(post.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Avatar>
                      <AvatarImage src={post.authorProfilePicture} />
                      <AvatarFallback>
                        {post.authorName.charAt(0).toUpperCase()}
                        {post.authorName.charAt(1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-medium text-sm">{post.authorName}</span>
                </div>
                {post.isPremium && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 border-orange-300"
                  >
                    Pro Member
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {truncateText(post.content, 120)}
              </p>

              {/* Skills to Learn */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  Wants to Learn
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.toLearn.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {post.toLearn.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.toLearn.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Skills to Teach */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  Can Teach
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.toTeach.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {post.toTeach.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.toTeach.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Available {post.availability.length} days/week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No posts found</h3>
            <p className="text-muted-foreground">Be the first to create a post in the community!</p>
          </div>
        </div>
      )}
    </div>
  )
}
