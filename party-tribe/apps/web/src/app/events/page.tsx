import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@party-tribe/ui";

export const metadata: Metadata = {
  title: "Events - Party Tribe™",
  description: "Discover amazing parties and events happening near you.",
};

export default function EventsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
          <p className="text-muted-foreground">
            Find amazing parties and events happening near you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="search"
                placeholder="Search events..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>All Categories</option>
              <option>Music</option>
              <option>Nightlife</option>
              <option>Social</option>
            </select>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>All Dates</option>
              <option>Today</option>
              <option>This Weekend</option>
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder Events */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-party-purple to-party-pink"></div>
              <CardHeader>
                <CardTitle>Sample Event {i + 1}</CardTitle>
                <CardDescription>
                  This is a placeholder event description. Real events will be loaded from the database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Dec 25, 2024 • 8:00 PM</span>
                  <span>$25</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}