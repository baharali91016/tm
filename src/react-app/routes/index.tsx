import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ListTodo,
  Zap,
  Users,
  Calendar,
  ArrowRight,
  Star,
  BarChart3,
  Clock,
} from "lucide-react";
import { getSession } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await getSession();
    if (data?.session) {
      redirect({ to: "/dashboard", throw: true });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <ListTodo className="size-4" />
            </div>
            <span className="text-xl font-bold">Task Manager Inc.</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-up">Let's Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-muted-foreground">
                Trusted by 10,000+ teams worldwide
              </span>
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Manage tasks with{" "}
              <span className="bg-linear-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                clarity and ease
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Streamline your workflow, collaborate seamlessly, and achieve more
              with our intuitive task management platform. Built for modern
              teams.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border bg-card p-2 shadow-2xl">
              <div className="rounded-xl bg-muted/50 p-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-background p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">To Do</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        4
                      </span>
                    </div>
                    <div className="space-y-3">
                      <TaskCard
                        title="Design system updates"
                        tag="Design"
                        color="bg-chart-1"
                      />
                      <TaskCard
                        title="API integration"
                        tag="Development"
                        color="bg-chart-2"
                      />
                      <TaskCard
                        title="User research"
                        tag="Research"
                        color="bg-chart-4"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">In Progress</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        2
                      </span>
                    </div>
                    <div className="space-y-3">
                      <TaskCard
                        title="Mobile app redesign"
                        tag="Design"
                        color="bg-chart-1"
                        priority
                      />
                      <TaskCard
                        title="Database optimization"
                        tag="Backend"
                        color="bg-chart-3"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        2
                      </span>
                    </div>
                    <div className="space-y-3">
                      <TaskCard
                        title="Landing page"
                        tag="Frontend"
                        color="bg-chart-5"
                        completed
                      />
                      <TaskCard
                        title="User authentication"
                        tag="Security"
                        color="bg-chart-2"
                        completed
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Powerful features designed to help you and your team work smarter,
              not harder.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Lightning Fast"
              description="Instant updates and real-time collaboration keep your team in sync."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Collaboration"
              description="Work together seamlessly with shared workspaces and team features."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Smart Scheduling"
              description="AI-powered scheduling helps you prioritize and meet deadlines."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics & Insights"
              description="Track progress and productivity with detailed analytics."
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number="10K+" label="Active Teams" />
            <StatCard number="2M+" label="Tasks Completed" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="4.9/5" label="User Rating" />
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by teams everywhere
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              See what our customers have to say about their experience.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="TaskFlow transformed how our team works. We've increased our productivity by 40% since switching."
              author="Sarah Chen"
              role="Product Manager at TechCorp"
            />
            <TestimonialCard
              quote="The best task management tool we've ever used. Simple, powerful, and beautiful."
              author="Mike Johnson"
              role="CEO at StartupXYZ"
            />
            <TestimonialCard
              quote="Finally, a tool that our entire team actually enjoys using. The collaboration features are incredible."
              author="Emily Rodriguez"
              role="Team Lead at DesignStudio"
            />
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center sm:px-16">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of teams already using TaskFlow to manage their
              work more effectively.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link to="/sign-up">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/60">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <ListTodo className="size-4" />
              </div>
              <span className="text-lg font-bold">Task Manager Inc.</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Task Manager Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold sm:text-4xl">{number}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="mb-6 text-muted-foreground">"{quote}"</p>
      <div>
        <div className="font-semibold">{author}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

function TaskCard({
  title,
  tag,
  color,
  priority,
  completed,
}: {
  title: string;
  tag: string;
  color: string;
  priority?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-3 ${completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-medium ${completed ? "line-through" : ""}`}
        >
          {title}
        </span>
        {priority && (
          <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
            High
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs text-muted-foreground">{tag}</span>
      </div>
      {!completed && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Due in 3 days</span>
        </div>
      )}
    </div>
  );
}
