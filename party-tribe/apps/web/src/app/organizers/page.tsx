import { Metadata } from "next";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@party-tribe/ui";
import { Calendar, Users, Star, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Organizer Console - Party Tribe™",
  description: "Manage your events and grow your community as an organizer.",
};

export default function OrganizersPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizer Console</h1>
            <p className="text-muted-foreground">
              Manage your events and grow your community.
            </p>
          </div>
          <Button variant="party" asChild>
            <Link href="/events/create">Create New Event</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Based on 89 reviews
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$5,240</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Events</h2>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sample Event {i + 1}</CardTitle>
                      <CardDescription>
                        Dec {25 + i}, 2024 • 8:00 PM • Sample Venue
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.floor(Math.random() * 100) + 20} attendees
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${Math.floor(Math.random() * 1000) + 500} revenue
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>New to organizing events?</CardTitle>
            <CardDescription>
              Get started with our comprehensive guide to creating successful events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/help/organizer-guide">Read Organizer Guide</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help/best-practices">Best Practices</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}