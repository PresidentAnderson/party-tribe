# Party Tribe™ Database Schema

This directory contains the Prisma schema and related database files for the Party Tribe™ platform.

## Files

- `schema.prisma` - The main Prisma schema file defining all models, relationships, and database configuration
- `seed.ts` - TypeScript seed script to populate the database with sample data
- `README.md` - This documentation file

## Schema Overview

The database schema supports a comprehensive event management and ticketing platform with the following key entities:

### Core Models

- **User** - Platform users with authentication and profile information
- **Tribe** - Event organizing groups/communities with branding and social links
- **TribeMember** - Membership relationships between users and tribes with roles
- **Event** - Individual events with venue, timing, and capacity information
- **EventCoHost** - Co-hosting relationships between tribes for revenue sharing

### Ticketing & Commerce

- **TicketTier** - Different ticket types/pricing for events
- **Order** - Purchase orders containing multiple tickets
- **Ticket** - Individual ticket instances with QR codes
- **Payout** - Financial settlements to tribes for their events

### Marketing & Growth

- **Referral** - Referral codes for user acquisition and discounts
- **Asset** - Media files associated with events and tribes

### Moderation

- **Moderation** - Moderation actions and administrative records

## Key Features

### Authentication & Users
- Multiple auth providers (Email, Google, Apple, Facebook)
- User profiles with avatar, location, and contact info
- Phone number support for notifications

### Tribes & Communities
- Branded tribe profiles with custom colors and social links
- Hierarchical membership roles (Owner, Organizer, Member)
- Tribe ownership and member management

### Events & Venues
- Comprehensive event information including timezone support
- Geolocation support for venue mapping
- Flexible door policies (Open, Member Only, Invite Only, Approval Required)
- Age restrictions and capacity management
- Event status tracking (Draft, Published, Cancelled, Completed)
- Event tagging system for categorization

### Ticketing System
- Multiple ticket tiers per event with different pricing
- Member-only ticket options
- Sales window controls (start/end times)
- QR code generation for ticket validation
- Ticket holder information and transfer support

### Revenue & Payouts
- Revenue sharing between co-hosting tribes (basis points)
- Automated payout tracking with Stripe integration
- Multi-currency support (defaults to USD)
- Payout status tracking and period-based settlements

### Referral System
- Flexible referral rewards (percentage, fixed amount, free tickets)
- Tribe-level and event-level referrals
- Usage tracking and redemption limits
- Referral code generation and management

### Content Management
- Asset management for images, videos, audio, and documents
- Metadata storage for asset properties
- Association with both events and tribes

### Moderation & Safety
- Comprehensive moderation system for all content types
- Admin action tracking with reasons
- Subject-based moderation (users, tribes, events, comments, messages)

## Database Setup

### Prerequisites
- PostgreSQL database (recommended) or SQLite for development
- Node.js 18+ and npm/yarn
- Prisma CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database connection string
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push schema to database:
```bash
npm run db:push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

### Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Run the seed script
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database and re-run migrations
- `npm run db:deploy` - Deploy migrations (production)

## Sample Data

The seed script creates sample data including:
- 4 users with different auth providers
- 3 tribes (Underground SF, Rooftop LA, NYC Nightlife)
- 3 events with realistic details and venues
- Multiple ticket tiers with different pricing strategies
- Sample orders and tickets with QR codes
- Referral codes for testing the growth system
- Media assets and moderation records
- Payout records showing revenue sharing

## Schema Relationships

### User Relationships
- Users can own multiple tribes
- Users can be members of multiple tribes with different roles
- Users can create events and purchase tickets
- Users can create referral codes

### Tribe Relationships
- Each tribe has one owner (user)
- Tribes can have multiple members with roles
- Tribes can host events and co-host others' events
- Tribes receive payouts for their events

### Event Relationships
- Events belong to one primary tribe
- Events can have multiple co-hosting tribes
- Events have multiple ticket tiers
- Events can have associated assets and referrals

### Ticket Flow
- Orders contain multiple tickets
- Tickets are instances of ticket tiers
- Each ticket has a unique QR code
- Ticket holders can be different from purchasers

## Indexes & Performance

The schema includes strategic indexes for:
- User lookups by email and auth provider
- Tribe lookups by slug and owner
- Event searches by status, date, and tribe
- Ticket validation by QR code
- Order tracking by user and event
- Referral code lookups
- Moderation record searches

## Security Considerations

- All foreign key relationships include appropriate cascade deletes
- Sensitive fields like payment intent IDs are optional
- QR codes are unique across the entire system
- Moderation actions are fully auditable
- User emails are unique and indexed

## Future Considerations

The schema is designed to be extensible for future features:
- Additional payment providers beyond Stripe
- More complex membership tiers and permissions
- Advanced analytics and reporting
- Social features (comments, likes, shares)
- Multi-language support
- Advanced venue management
- Integration with external ticketing platforms