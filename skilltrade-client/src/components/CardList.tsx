"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

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

interface CardListProps {
  title: string
  reviews?: Review[]
  loading?: boolean
  cardClassName?: string
}

const CardList = ({ title, reviews = [], loading = false, cardClassName = "" }: CardListProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="max-h-64 overflow-y-auto space-y-3">
        {reviews.length === 0 ? (
          <Card className={cardClassName}>
            <CardContent className="p-4 text-center text-muted-foreground">
              No reviews yet
            </CardContent>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id} className={cardClassName}>
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={review.reviewBy.profilePicture} />
                    <AvatarFallback>{review.reviewBy.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{review.reviewBy.fullName}</p>
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.review}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CardList
