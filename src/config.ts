// ============================================================
// Site Configuration — AI Room Makeover & Interior Inspiration
// ============================================================

// --- Site ---

export interface SiteConfig {
  language: string
  brandName: string
}

export const siteConfig: SiteConfig = {
  language: "en",
  brandName: "ROOMIFY",
}

// --- Navigation ---

export interface NavigationConfig {
  menuLabel: string
  closeLabel: string
  fullscreenMenuLinks: { label: string; target: string }[]
  menuSideInfo: string[]
}

export const navigationConfig: NavigationConfig = {
  menuLabel: "MENU",
  closeLabel: "CLOSE",
  fullscreenMenuLinks: [
    { label: "THE ROOMS", target: "hero" },
    { label: "HOW IT WORKS", target: "consciousness" },
    { label: "TRANSFORM", target: "lighthouse" },
    { label: "GALLERY", target: "waves-gallery" },
    { label: "INSPIRE", target: "waves-video" },
    { label: "TRENDS", target: "/trends" },
    { label: "FOOTER", target: "footer" },
  ],
  menuSideInfo: [
    "AI-POWERED DESIGN",
    "LIVE TREND TRACKING",
    "12 ROOM TYPES",
    "INSTANT MAKEOVERS",
  ],
}

// --- Hero Room Gallery ---

export interface RoomConfig {
  name: string
  className: string
  theme: "light" | "dark"
  images: {
    back: string[]
    left: string[]
    right: string[]
  }
}

export interface HeroConfig {
  mainTitle: string
  rooms: RoomConfig[]
  metaLines: string[]
}

export const heroConfig: HeroConfig = {
  mainTitle: "AI Room Makeover",
  rooms: [
    {
      name: "Modern Minimalist",
      className: "room--waves",
      theme: "dark",
      images: {
        back: ["images/rooms/room1-back.jpg"],
        left: ["images/rooms/room1-left.jpg"],
        right: ["images/rooms/room1-right.jpg"],
      },
    },
    {
      name: "Scandinavian",
      className: "room--monk",
      theme: "light",
      images: {
        back: ["images/rooms/room2-back.jpg"],
        left: ["images/rooms/room2-left.jpg"],
        right: ["images/rooms/room2-right.jpg"],
      },
    },
    {
      name: "Japandi",
      className: "room--lighthouse",
      theme: "dark",
      images: {
        back: ["images/rooms/room3-back.jpg"],
        left: ["images/rooms/room3-left.jpg"],
        right: ["images/rooms/room3-right.jpg"],
      },
    },
    {
      name: "Luxury",
      className: "room--orlando",
      theme: "light",
      images: {
        back: ["images/rooms/room4-back.jpg"],
        left: ["images/rooms/room4-left.jpg"],
        right: ["images/rooms/room4-right.jpg"],
      },
    },
  ],
  metaLines: [
    "Transform Any Room with AI",
    "Modern · Scandinavian · Japandi · Luxury · Boho · Industrial",
    "Upload Your Room → Choose a Style → Get Your Makeover",
  ],
}

// --- Particle Sculpture ---

export interface ParticleConfig {
  sectionLabel: string
  title: string
  paragraphs: string[]
  quote: string
}

export const particleConfig: ParticleConfig = {
  sectionLabel: "01 / HOW IT WORKS",
  title: "The Future of Interior Design",
  paragraphs: [
    "<strong>Upload your room photo</strong> and watch as our AI engine analyzes your space — identifying furniture, lighting, layout, and existing decor elements in seconds. No measuring, no mood boards, no endless Pinterest scrolling.",
    "<strong>Choose from 9 signature styles</strong> including Modern Minimalist, Scandinavian, Japandi, Luxury, Boho, Industrial, Traditional Indian, Smart Home, and more. Each style is crafted by professional interior designers and trained on thousands of real room transformations.",
    "<strong>Get instant before/after comparisons</strong>, detailed color palettes, furniture recommendations with shopping links, and a complete budget breakdown. Every generated image is Pinterest-ready and optimized for sharing.",
    "<em>From small bedroom ideas to luxury living room makeovers</em> — Roomify helps you visualize, plan, and execute your dream space without hiring an expensive designer.",
  ],
  quote: "Your room, reimagined by AI. Every style, every budget, every dream space — just one upload away.",
}

// --- Lighthouse Video ---

export interface LighthouseVideoConfig {
  sectionLabel: string
  dataPoints: string[]
  description: string
  videoPath: string
}

export const lighthouseVideoConfig: LighthouseVideoConfig = {
  sectionLabel: "ROOM TRANSFORMATION",
  dataPoints: [
    "FEATURED MAKEOVERS",
    "CLICK TO TRY ANY STYLE",
    "INSTANT AI GENERATION",
  ],
  description: "Browse our curated room transformations. Click 'Try This Style' on any design to start your makeover with that look pre-selected.",
  videoPath: "videos/lighthouse.mp4",
}

// --- Waves Video ---

export interface WavesVideoConfig {
  sectionLabel: string
  title: string
  ctaText: string
  videoPath: string
}

export const wavesVideoConfig: WavesVideoConfig = {
  sectionLabel: "02 / INSPIRE",
  title: "Before & After Transformations",
  ctaText: "START YOUR MAKEOVER",
  videoPath: "videos/waves.mp4",
}

// --- Image Gallery ---

export interface GalleryItem {
  src: string
  caption: string
  description: string
}

export interface GalleryConfig {
  sectionLabel: string
  sectionTitle: string
  items: GalleryItem[]
  lightboxCloseHint: string
}

export const galleryConfig: GalleryConfig = {
  sectionLabel: "03 / STYLE GALLERY",
  sectionTitle: "Every Style, Your Room",
  items: [
    {
      src: "images/gallery/item1.jpg",
      caption: "Boho Living Room",
      description: "A warm, eclectic boho living space featuring rattan furniture, macrame wall hangings, colorful patterned rugs, and abundant indoor plants. This style embraces natural materials, layered textures, and a free-spirited aesthetic perfect for creative souls.",
    },
    {
      src: "images/gallery/item2.jpg",
      caption: "Industrial Loft",
      description: "Raw and refined industrial loft design with exposed brick walls, steel beam ceilings, large factory windows, and vintage Edison bulb lighting. Leather sofas and reclaimed wood furniture add warmth to the urban edge.",
    },
    {
      src: "images/gallery/item3.jpg",
      caption: "Traditional Indian",
      description: "A vibrant Indian apartment living room featuring carved wooden furniture, brass accents, colorful cushions and textiles, and decorative mirrors. This fusion style blends traditional craftsmanship with modern comfort for a truly unique space.",
    },
    {
      src: "images/gallery/item4.jpg",
      caption: "Smart Home Living",
      description: "A futuristic smart home living room with sleek white entertainment units, hidden LED strip lighting, automated curtains, and integrated technology. Minimalist furniture meets cutting-edge automation for the ultimate modern lifestyle.",
    },
    {
      src: "images/gallery/item5.jpg",
      caption: "Small Bedroom Makeover",
      description: "A clever small bedroom transformation using space-saving furniture, floating shelves, warm string lights, and a compact workspace corner. Light colors maximize the sense of space while mirrors create visual depth.",
    },
    {
      src: "images/gallery/item6.jpg",
      caption: "Modern Kitchen",
      description: "A stunning kitchen renovation featuring white cabinets with gold handles, marble countertops, a functional kitchen island with bar stools, and elegant pendant lighting. Open shelving showcases beautiful ceramic dishes.",
    },
    {
      src: "images/gallery/item7.jpg",
      caption: "Home Office Design",
      description: "A productive and stylish home office featuring a wooden desk with an ergonomic chair, floor-to-ceiling bookshelf, large window with natural light, indoor plants, and minimalist wall art. Designed for focus and creativity.",
    },
    {
      src: "images/gallery/item8.jpg",
      caption: "Teen Bedroom Ideas",
      description: "A trendy teen bedroom featuring neon LED signs, colorful bedding, a gaming desk setup, polaroid photo walls, and fun decorative elements. This vibrant space balances personality with functionality.",
    },
    {
      src: "images/gallery/item9.jpg",
      caption: "TV Wall Design",
      description: "An elegant TV wall design featuring chevron wood paneling, ambient backlighting, floating shelves with curated decor, and a sleek media console. The warm wood tones create a cozy entertainment focal point.",
    },
  ],
  lightboxCloseHint: "Press Esc or click outside to close",
}

// --- Footer ---

export interface FooterLinkColumn {
  heading: string
  links: string[]
}

export interface FooterConfig {
  linkColumns: FooterLinkColumn[]
  tickerWords: string[]
  copyright: string
}

export const footerConfig: FooterConfig = {
  linkColumns: [
    {
      heading: "STYLE STUDIO",
      links: [
        "Modern Minimalist",
        "Scandinavian",
        "Japandi",
        "Luxury",
        "Boho",
        "Industrial",
      ],
    },
    {
      heading: "RESOURCES",
      links: [
        "Small Bedroom Ideas",
        "Living Room Makeovers",
        "Kitchen Design Tips",
        "Home Office Setup",
        "TV Wall Inspiration",
        "Budget Planner",
      ],
    },
  ],
  tickerWords: [
    "MODERN",
    "BOHO",
    "JAPANDI",
    "LUXURY",
    "DESIGN",
    "TRANSFORM",
    "INSPIRE",
    "ROOMIFY",
  ],
  copyright: "© 2026 Roomify AI. All rights reserved.",
}
