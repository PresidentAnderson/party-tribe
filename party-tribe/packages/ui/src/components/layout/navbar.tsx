"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, Plus } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface NavbarProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-party-purple to-party-pink"></div>
            <span className="hidden font-bold sm:inline-block">
              Party Tribe
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/events"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Events
            </Link>
            <Link
              href="/tribes"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tribes
            </Link>
            <Link
              href="/organizers"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Organizers
            </Link>
          </nav>
        </div>
        
        {/* Search */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, tribes..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          
          {/* Right side */}
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events/create">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Event
                  </Link>
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="party" size="sm" asChild>
                  <Link href="/auth/signup">Join Party Tribe</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}