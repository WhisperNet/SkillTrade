"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Review {
  id: string
  rating: number
}

interface RatingBarChartProps {
  reviews: Review[]
  loading?: boolean
}

const RatingBarChart = ({ reviews, loading = false }: RatingBarChartProps) => {
  // Calculate rating distribution
  const ratingCounts = {
    "1 Star": 0,
    "2 Stars": 0,
    "3 Stars": 0,
    "4 Stars": 0,
    "5 Stars": 0,
  }

  reviews.forEach(review => {
    switch (review.rating) {
      case 1:
        ratingCounts["1 Star"]++
        break
      case 2:
        ratingCounts["2 Stars"]++
        break
      case 3:
        ratingCounts["3 Stars"]++
        break
      case 4:
        ratingCounts["4 Stars"]++
        break
      case 5:
        ratingCounts["5 Stars"]++
        break
    }
  })

  const data = [
    { name: "1★", count: ratingCounts["1 Star"], fill: "#ef4444" },
    { name: "2★", count: ratingCounts["2 Stars"], fill: "#f97316" },
    { name: "3★", count: ratingCounts["3 Stars"], fill: "#eab308" },
    { name: "4★", count: ratingCounts["4 Stars"], fill: "#22c55e" },
    { name: "5★", count: ratingCounts["5 Stars"], fill: "#16a34a" },
  ]

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalReviews = reviews.length

  if (totalReviews === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-semibold">No Reviews Yet</p>
          <p className="text-sm">Rating distribution will appear here once reviews are added.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} />
          <Tooltip
            formatter={(value: number) => [`${value} review${value !== 1 ? "s" : ""}`, "Count"]}
            labelFormatter={label => `Rating: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RatingBarChart
