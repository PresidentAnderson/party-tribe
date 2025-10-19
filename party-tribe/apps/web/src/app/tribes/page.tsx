import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@party-tribe/ui";
import { Users, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Tribes - Party Tribe™",
  description: "Join tribes and connect with like-minded party enthusiasts.",
};

export default function TribesPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Tribes</h1>
          <p className="text-muted-foreground">
            Join tribes and connect with like-minded party enthusiasts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="search"
                placeholder="Search tribes..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>All Interests</option>
              <option>Music</option>
              <option>Tech</option>
              <option>Art</option>
              <option>Sports</option>
            </select>
          </div>
        </div>

        {/* Tribes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder Tribes */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-party-blue to-party-green"></div>
              <CardHeader>
                <CardTitle>Sample Tribe {i + 1}</CardTitle>
                <CardDescription>
                  This is a placeholder tribe description. Real tribes will be loaded from the database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 500) + 50} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 20) + 5} events</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}