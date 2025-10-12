# Cookable

A modern recipe management application built with the T3 Stack. Discover, create, and organize your favorite recipes with an intuitive interface.

## Features

- 🍳 Create and manage your recipe collection
- 🎲 "Feeling Lucky" feature to discover random recipes
- 👤 User authentication and profiles
- 📱 Responsive design for all devices
- 🌍 Multilingual welcome messages

## Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Set up your environment variables (copy `.env.example` to `.env`)
4. Set up the database: `bun run db:push`
5. Start the development server: `bun run dev`

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Development

Available scripts:
- `bun run dev` - Start development server with Turbo
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run typecheck` - Run TypeScript checks
- `bun run check` - Run Biome linting
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:generate` - Generate database migrations

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
