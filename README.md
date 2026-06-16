# Roomify AI - Interior Design Makeover Platform

AI-powered room transformation web application. Upload a photo of your room, choose a design style, and get an AI-generated redesign with furniture recommendations, color palettes, and shopping links.

## Features

- **AI Room Makeover** - Upload your room photo and get AI-generated redesigns
- **8 Design Styles** - Modern, Scandinavian, Japandi, Luxury, Boho, Industrial, Traditional Indian, Smart Home
- **12 Room Types** - Bedroom, Living Room, Kitchen, Bathroom, Home Office, Dining Room, Entryway, Balcony, Kid's Room, Pooja Room, Wardrobe, Guest Room
- **Before/After Slider** - Compare original with AI-generated design
- **Furniture Recommendations** - Curated products with Amazon India affiliate links
- **Color Palette Extractor** - 5-color palette from generated designs
- **Pinterest-Ready Export** - Generate shareable images for social media
- **Style Gallery** - 21 curated interior design styles with product recommendations
- **Trend Aggregator** - Live trend detection from Reddit, Google Trends, and Unsplash
- **Week-Based Rotation** - Gallery refreshes with trending styles

## Tech Stack

**Frontend:**
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- GSAP + ScrollTrigger animations
- Three.js particle effects
- HTML Canvas API for image generation

**Backend:**
- Hono + tRPC 11.x (type-safe API)
- Drizzle ORM + MySQL
- Leonardo AI image generation
- Reddit/Google Trends/Unsplash trend aggregation

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env - add your Leonardo AI key, database URL

# Push database schema
npm run db:push

# Seed gallery data
npx tsx db/seed.ts

# Start dev server
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `AI_PROVIDER` | Yes | `leonardo` (or `mock` for testing) |
| `LEONARDO_API_KEY` | Yes | Your Leonardo AI API key |
| `AFFILIATE_TAG` | Yes | Amazon Associates tracking ID |
| `API_SECRET` | Yes | Random secret for API security |

## Project Structure

```
/
├── api/                  # Backend (tRPC routers, AI service, trend aggregator)
│   ├── ai-service.ts     # Leonardo AI image generation
│   ├── gallery.ts        # Gallery CRUD API
│   ├── trends.ts         # Trend aggregator API
│   └── boot.ts           # Server entry point
├── db/                   # Database schema and seed
│   ├── schema.ts         # 6 tables (rooms, makeovers, furniture, gallery, contacts, trends)
│   └── seed.ts           # 21 gallery styles seed data
├── src/
│   ├── sections/         # Page sections (Hero, Gallery, Makeover, etc.)
│   ├── pages/            # Route pages (Makeover, Trends, Gallery Manager)
│   ├── data/             # Static data (room types, styles, color palettes)
│   └── contexts/         # React Context (Makeover state management)
├── public/
│   ├── images/           # Room and gallery images (33 total)
│   └── videos/           # Background videos (2)
├── .env                  # Secrets (NOT committed)
├── .env.example          # Template for new setups
└── HOSTINGER_DEPLOY.md   # Deployment guide
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | 3D gallery, featured transformations, style gallery, videos |
| `/#/makeover` | AI Makeover | 4-step wizard: Upload → Style → Generate → Results |
| `/#/trends` | Trend Dashboard | Live interior design trend rankings |
| `/#/manage-gallery` | Gallery Admin | Add/edit/delete gallery styles (requires backend) |

## Deployment

See [HOSTINGER_DEPLOY.md](HOSTINGER_DEPLOY.md) for complete deployment instructions.

Quick deploy:
```bash
npm run build
# Upload dist/ to your hosting provider
# Or follow HOSTINGER_DEPLOY.md for full backend deployment
```

## Monetization

- **Amazon Associates** - All furniture links include your affiliate tag (`5010b3-21`)
- **Trend Data** - Can be sold as API access to other interior design tools
- **Premium Features** - Unlock more styles, higher resolution, faster generation

## License

MIT
# roomify
