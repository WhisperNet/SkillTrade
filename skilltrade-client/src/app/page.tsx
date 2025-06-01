import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-background to-muted">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Exchange Skills, <span className="text-primary">Grow Together</span>
        </h1>
        <p className="max-w-[700px] mt-4 text-lg text-muted-foreground sm:text-xl">
          Join SkillTrade to teach what you know and learn what you don't. Connect with experts and
          enthusiasts in your community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/users/signup">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/learnmore">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillTrade?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Learning</h3>
              <p className="text-muted-foreground">
                Connect with like-minded individuals and build meaningful relationships while
                learning.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <BookOpen className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Skill Exchange</h3>
              <p className="text-muted-foreground">
                Teach your expertise and learn new skills in return. No money needed, just knowledge
                sharing.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personal Growth</h3>
              <p className="text-muted-foreground">
                Expand your knowledge base and develop new skills through hands-on learning
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg mb-8 max-w-[600px] mx-auto">
            Join thousands of learners and teachers who are already exchanging skills on SkillTrade.
          </p>
          <Button size="lg" variant="secondary" className="gap-2">
            Join Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
