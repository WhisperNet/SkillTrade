"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useRef } from "react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Web Developer",
    image: "/avatars/sarah.jpg",
    content:
      "SkillTrade has completely transformed how I learn new programming skills. The community is incredibly supportive and the skill exchange system is brilliant!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "UI/UX Designer",
    image: "/avatars/michael.jpg",
    content:
      "I've found amazing mentors through SkillTrade. The platform makes it easy to connect with experts and learn at your own pace.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Data Scientist",
    image: "/avatars/emma.jpg",
    content:
      "The quality of skill exchanges on this platform is outstanding. I've both taught and learned valuable skills that have helped advance my career.",
    rating: 5,
  },
]

const features = [
  {
    title: "Skill Exchange",
    description: "Trade your expertise for new skills in a fair and efficient marketplace.",
    icon: "🔄",
  },
  {
    title: "Expert Community",
    description: "Connect with professionals and enthusiasts from various fields.",
    icon: "👥",
  },
  {
    title: "Verified Profiles",
    description: "Trust in our verification system that ensures quality exchanges.",
    icon: "✓",
  },
  {
    title: "Flexible Learning",
    description: "Learn at your own pace with personalized skill exchange schedules.",
    icon: "📅",
  },
]

export default function LearnMorePage() {
  const router = useRouter()
  const featuresRef = useRef<HTMLDivElement>(null)

  const handleGetStarted = () => {
    router.push("/users/signup")
  }

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Learn, Share, and Grow Together
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community of learners and experts. Exchange skills, build connections, and
              advance your career through meaningful knowledge sharing.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillTrade?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                  <div className="mt-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners and experts who are already benefiting from SkillTrade.
          </p>
          <Button size="lg" variant="secondary">
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  )
}
