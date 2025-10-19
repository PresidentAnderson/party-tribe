import { PrismaClient } from '@prisma/client'
import {
  AuthProvider,
  TribeMemberRole,
  EventStatus,
  DoorPolicy,
  OrderStatus,
  TicketStatus,
  ReferralRewardType,
  AssetType,
  ModerationAction,
  ModerationSubjectType,
  PayoutStatus
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.ticketTier.deleteMany()
  await prisma.eventCoHost.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.event.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.tribeMember.deleteMany()
  await prisma.tribe.deleteMany()
  await prisma.moderation.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@partytribe.com',
        phone: '+1234567890',
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        location: 'San Francisco, CA',
        authProvider: AuthProvider.EMAIL,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@partytribe.com',
        phone: '+1234567891',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2c3c501?w=400',
        location: 'Los Angeles, CA',
        authProvider: AuthProvider.GOOGLE,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@partytribe.com',
        phone: '+1234567892',
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        location: 'New York, NY',
        authProvider: AuthProvider.APPLE,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@partytribe.com',
        phone: '+1234567893',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        location: 'Miami, FL',
        authProvider: AuthProvider.EMAIL,
      },
    }),
  ])

  console.log('✅ Created users')

  // Create Tribes
  const tribes = await Promise.all([
    prisma.tribe.create({
      data: {
        slug: 'underground-sf',
        name: 'Underground SF',
        bio: 'Bringing the best underground electronic music to San Francisco',
        coverUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
        brandPrimary: '#FF6B35',
        brandSecondary: '#F7931E',
        socialLinks: {
          instagram: '@underground_sf',
          twitter: '@undergroundsf',
          website: 'https://underground-sf.com'
        },
        ownerId: users[0].id,
      },
    }),
    prisma.tribe.create({
      data: {
        slug: 'rooftop-la',
        name: 'Rooftop LA',
        bio: 'Exclusive rooftop parties with stunning city views',
        coverUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200',
        brandPrimary: '#8B5CF6',
        brandSecondary: '#A78BFA',
        socialLinks: {
          instagram: '@rooftop_la',
          tiktok: '@rooftopla'
        },
        ownerId: users[1].id,
      },
    }),
    prisma.tribe.create({
      data: {
        slug: 'nyc-nightlife',
        name: 'NYC Nightlife',
        bio: 'The hottest parties in the city that never sleeps',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
        brandPrimary: '#EF4444',
        brandSecondary: '#F87171',
        socialLinks: {
          instagram: '@nyc_nightlife',
          twitter: '@nycnightlife'
        },
        ownerId: users[2].id,
      },
    }),
  ])

  console.log('✅ Created tribes')

  // Create Tribe Members
  await Promise.all([
    // Underground SF members
    prisma.tribeMember.create({
      data: {
        userId: users[0].id,
        tribeId: tribes[0].id,
        role: TribeMemberRole.OWNER,
      },
    }),
    prisma.tribeMember.create({
      data: {
        userId: users[1].id,
        tribeId: tribes[0].id,
        role: TribeMemberRole.ORGANIZER,
      },
    }),
    prisma.tribeMember.create({
      data: {
        userId: users[3].id,
        tribeId: tribes[0].id,
        role: TribeMemberRole.MEMBER,
      },
    }),
    // Rooftop LA members
    prisma.tribeMember.create({
      data: {
        userId: users[1].id,
        tribeId: tribes[1].id,
        role: TribeMemberRole.OWNER,
      },
    }),
    prisma.tribeMember.create({
      data: {
        userId: users[0].id,
        tribeId: tribes[1].id,
        role: TribeMemberRole.MEMBER,
      },
    }),
    // NYC Nightlife members
    prisma.tribeMember.create({
      data: {
        userId: users[2].id,
        tribeId: tribes[2].id,
        role: TribeMemberRole.OWNER,
      },
    }),
  ])

  console.log('✅ Created tribe memberships')

  // Create Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        slug: 'warehouse-underground-2025',
        title: 'Warehouse Underground 2025',
        description: 'An immersive underground techno experience in a converted warehouse space',
        startAt: new Date('2025-12-15T22:00:00Z'),
        endAt: new Date('2025-12-16T06:00:00Z'),
        timezone: 'America/Los_Angeles',
        venueName: 'The Warehouse',
        venueAddress: '123 Industrial Ave, San Francisco, CA 94103',
        lat: 37.7749,
        lng: -122.4194,
        status: EventStatus.PUBLISHED,
        doorPolicy: DoorPolicy.MEMBER_ONLY,
        ageLimit: 21,
        tags: ['techno', 'underground', 'warehouse', 'electronic'],
        capacityTotal: 500,
        capacityRemaining: 350,
        tribeId: tribes[0].id,
        createdBy: users[0].id,
      },
    }),
    prisma.event.create({
      data: {
        slug: 'sunset-rooftop-vibes',
        title: 'Sunset Rooftop Vibes',
        description: 'Watch the sunset over LA while dancing to deep house beats',
        startAt: new Date('2025-11-30T18:00:00Z'),
        endAt: new Date('2025-12-01T02:00:00Z'),
        timezone: 'America/Los_Angeles',
        venueName: 'Sky Lounge',
        venueAddress: '456 Hollywood Blvd, Los Angeles, CA 90028',
        lat: 34.0522,
        lng: -118.2437,
        status: EventStatus.PUBLISHED,
        doorPolicy: DoorPolicy.APPROVAL_REQUIRED,
        ageLimit: 18,
        tags: ['house', 'rooftop', 'sunset', 'vibes'],
        capacityTotal: 200,
        capacityRemaining: 120,
        tribeId: tribes[1].id,
        createdBy: users[1].id,
      },
    }),
    prisma.event.create({
      data: {
        slug: 'manhattan-after-hours',
        title: 'Manhattan After Hours',
        description: 'Late night deep house and techno in the heart of Manhattan',
        startAt: new Date('2025-12-31T23:00:00Z'),
        endAt: new Date('2026-01-01T08:00:00Z'),
        timezone: 'America/New_York',
        venueName: 'The Underground',
        venueAddress: '789 Broadway, New York, NY 10003',
        lat: 40.7128,
        lng: -74.0060,
        status: EventStatus.PUBLISHED,
        doorPolicy: DoorPolicy.OPEN,
        ageLimit: 21,
        tags: ['house', 'techno', 'nye', 'manhattan'],
        capacityTotal: 800,
        capacityRemaining: 600,
        tribeId: tribes[2].id,
        createdBy: users[2].id,
      },
    }),
  ])

  console.log('✅ Created events')

  // Create Event Co-Hosts
  await prisma.eventCoHost.create({
    data: {
      eventId: events[0].id,
      tribeId: tribes[1].id,
      revShareBps: 2000, // 20% revenue share
    },
  })

  console.log('✅ Created event co-hosts')

  // Create Ticket Tiers
  const ticketTiers = await Promise.all([
    // Warehouse Underground tickets
    prisma.ticketTier.create({
      data: {
        eventId: events[0].id,
        name: 'Early Bird',
        priceCents: 2500, // $25.00
        currency: 'USD',
        quantityTotal: 100,
        quantityRemaining: 50,
        isMemberOnly: true,
        salesStartAt: new Date('2025-10-01T00:00:00Z'),
        salesEndAt: new Date('2025-11-01T00:00:00Z'),
      },
    }),
    prisma.ticketTier.create({
      data: {
        eventId: events[0].id,
        name: 'General Admission',
        priceCents: 3500, // $35.00
        currency: 'USD',
        quantityTotal: 300,
        quantityRemaining: 200,
        isMemberOnly: false,
        salesStartAt: new Date('2025-11-01T00:00:00Z'),
        salesEndAt: new Date('2025-12-15T20:00:00Z'),
      },
    }),
    prisma.ticketTier.create({
      data: {
        eventId: events[0].id,
        name: 'VIP',
        priceCents: 7500, // $75.00
        currency: 'USD',
        quantityTotal: 50,
        quantityRemaining: 30,
        isMemberOnly: false,
        salesStartAt: new Date('2025-10-01T00:00:00Z'),
        salesEndAt: new Date('2025-12-15T20:00:00Z'),
      },
    }),
    // Sunset Rooftop tickets
    prisma.ticketTier.create({
      data: {
        eventId: events[1].id,
        name: 'Standard',
        priceCents: 4000, // $40.00
        currency: 'USD',
        quantityTotal: 150,
        quantityRemaining: 80,
        isMemberOnly: false,
        salesStartAt: new Date('2025-10-15T00:00:00Z'),
        salesEndAt: new Date('2025-11-30T16:00:00Z'),
      },
    }),
    prisma.ticketTier.create({
      data: {
        eventId: events[1].id,
        name: 'Premium',
        priceCents: 6500, // $65.00
        currency: 'USD',
        quantityTotal: 50,
        quantityRemaining: 40,
        isMemberOnly: false,
        salesStartAt: new Date('2025-10-15T00:00:00Z'),
        salesEndAt: new Date('2025-11-30T16:00:00Z'),
      },
    }),
  ])

  console.log('✅ Created ticket tiers')

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        eventId: events[0].id,
        userId: users[1].id,
        status: OrderStatus.CONFIRMED,
        totalCents: 5000, // $50.00
        currency: 'USD',
        stripePaymentIntentId: 'pi_1234567890',
      },
    }),
    prisma.order.create({
      data: {
        eventId: events[0].id,
        userId: users[3].id,
        status: OrderStatus.CONFIRMED,
        totalCents: 3500, // $35.00
        currency: 'USD',
        stripePaymentIntentId: 'pi_0987654321',
        referralCode: 'FRIEND10',
      },
    }),
    prisma.order.create({
      data: {
        eventId: events[1].id,
        userId: users[0].id,
        status: OrderStatus.PENDING,
        totalCents: 4000, // $40.00
        currency: 'USD',
      },
    }),
  ])

  console.log('✅ Created orders')

  // Create Tickets
  await Promise.all([
    prisma.ticket.create({
      data: {
        orderId: orders[0].id,
        ticketTierId: ticketTiers[0].id,
        holderName: 'Sarah Chen',
        holderEmail: 'sarah@partytribe.com',
        qrCode: 'QR_WAREHOUSE_001',
        status: TicketStatus.ACTIVE,
      },
    }),
    prisma.ticket.create({
      data: {
        orderId: orders[0].id,
        ticketTierId: ticketTiers[0].id,
        holderName: 'Guest +1',
        holderEmail: 'sarah@partytribe.com',
        qrCode: 'QR_WAREHOUSE_002',
        status: TicketStatus.ACTIVE,
      },
    }),
    prisma.ticket.create({
      data: {
        orderId: orders[1].id,
        ticketTierId: ticketTiers[1].id,
        holderName: 'Emma Wilson',
        holderEmail: 'emma@partytribe.com',
        qrCode: 'QR_WAREHOUSE_003',
        status: TicketStatus.ACTIVE,
      },
    }),
  ])

  console.log('✅ Created tickets')

  // Create Referrals
  await Promise.all([
    prisma.referral.create({
      data: {
        code: 'FRIEND10',
        ownerUserId: users[0].id,
        tribeId: tribes[0].id,
        rewardType: ReferralRewardType.PERCENTAGE,
        rewardValue: 10, // 10% discount
        redemptionCount: 1,
        maxRedemptions: 50,
      },
    }),
    prisma.referral.create({
      data: {
        code: 'ROOFTOP5',
        ownerUserId: users[1].id,
        eventId: events[1].id,
        rewardType: ReferralRewardType.FIXED_AMOUNT,
        rewardValue: 500, // $5.00 discount
        redemptionCount: 0,
        maxRedemptions: 25,
      },
    }),
  ])

  console.log('✅ Created referrals')

  // Create Assets
  await Promise.all([
    prisma.asset.create({
      data: {
        eventId: events[0].id,
        type: AssetType.IMAGE,
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        meta: {
          width: 800,
          height: 600,
          size: 524288,
          alt: 'Warehouse event venue photo'
        },
      },
    }),
    prisma.asset.create({
      data: {
        tribeId: tribes[1].id,
        type: AssetType.VIDEO,
        url: 'https://example.com/rooftop-promo.mp4',
        meta: {
          duration: 30,
          size: 15728640,
          format: 'mp4'
        },
      },
    }),
  ])

  console.log('✅ Created assets')

  // Create Moderation Records
  await prisma.moderation.create({
    data: {
      subjectType: ModerationSubjectType.USER,
      subjectId: users[3].id,
      action: ModerationAction.WARNING,
      reason: 'Inappropriate behavior reported at event',
      actorAdminId: 'admin_001',
    },
  })

  console.log('✅ Created moderation records')

  // Create Payouts
  await Promise.all([
    prisma.payout.create({
      data: {
        tribeId: tribes[0].id,
        periodStart: new Date('2025-10-01T00:00:00Z'),
        periodEnd: new Date('2025-10-31T23:59:59Z'),
        amountCents: 125000, // $1,250.00
        currency: 'USD',
        stripeTransferId: 'tr_1234567890',
        status: PayoutStatus.COMPLETED,
      },
    }),
    prisma.payout.create({
      data: {
        tribeId: tribes[1].id,
        periodStart: new Date('2025-10-01T00:00:00Z'),
        periodEnd: new Date('2025-10-31T23:59:59Z'),
        amountCents: 87500, // $875.00
        currency: 'USD',
        status: PayoutStatus.PENDING,
      },
    }),
  ])

  console.log('✅ Created payouts')

  console.log('🎉 Seed completed successfully!')
  console.log(`
📊 Created:
- ${users.length} users
- ${tribes.length} tribes
- ${events.length} events
- ${ticketTiers.length} ticket tiers
- ${orders.length} orders
- 3 tickets
- 2 referrals
- 2 assets
- 1 moderation record
- 2 payouts
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })