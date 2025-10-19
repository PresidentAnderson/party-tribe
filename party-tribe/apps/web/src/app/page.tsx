import Link from "next/link";
import { Calendar, Users, Sparkles, ArrowRight } from "lucide-react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@party-tribe/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-party-purple via-party-pink to-party-blue py-24 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Party Tribe™
                  </span>
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  The ultimate platform connecting party organizers with enthusiastic attendees. 
                  Discover amazing events, join tribes, and make unforgettable memories.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/events">
                    Explore Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                  <Link href="/organizers">
                    Become an Organizer
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-sm text-gray-300">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm text-gray-300">Events</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">50+</div>
                      <div className="text-sm text-gray-300">Tribes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-sm text-gray-300">Cities</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Why Choose Party Tribe?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to organize, discover, and attend amazing parties in one platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-party-purple" />
                <CardTitle>Discover Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Find amazing parties and events happening near you. Filter by location, date, 
                  type, and more to discover your perfect night out.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Users className="mx-auto h-12 w-12 text-party-pink" />
                <CardTitle>Join Tribes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with like-minded party enthusiasts. Join tribes based on your interests 
                  and get exclusive access to members-only events.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-party-blue" />
                <CardTitle>Organize Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Create and manage your own events with our powerful organizer tools. 
                  Build your community and make your mark in the party scene.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Join the Tribe?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Start your party journey today. It's free to join and you'll instantly get access to 
                hundreds of amazing events in your area.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="party" asChild>
                <Link href="/auth/signup">
                  Join Party Tribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}