import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { galleryConfig } from '../config';
import { trpc } from '@/providers/trpc';
import StyleDetailModal from '../components/StyleDetailModal';
import type { GalleryDetail } from '../data/galleryDetailData';

gsap.registerPlugin(ScrollTrigger);

// --- Static fallback data (works without backend) ---
interface StaticGalleryItem {
  id: string;
  caption: string;
  description: string;
  image: string;
  style: string;
  weekSlot: string;
  totalBudget: number;
  timeEstimate: string;
  difficulty: string;
  products: GalleryDetail['products'];
  changes: GalleryDetail['changes'];
  colors: GalleryDetail['colors'];
}

const weekLabels: Record<string, string> = {
  ALL: 'All Styles',
  W1: 'Trending',
  W2: 'Global',
  W3: 'Classic',
  W4: 'Nature',
};

const staticGalleryItems: StaticGalleryItem[] = [
  {
    id: 'boho-living', caption: 'Boho Living Room', image: 'images/gallery/item1.jpg',
    description: 'A warm, eclectic boho living space featuring rattan furniture, macrame wall hangings, colorful patterned rugs, and abundant indoor plants.',
    style: 'Bohemian', weekSlot: 'W1', totalBudget: 39500, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Rattan 3-Seater Sofa', price: 22000, link: `https://www.amazon.in/s?k=${encodeURIComponent('rattan sofa 3 seater')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Macrame Wall Hanging Set', price: 1800, link: `https://www.amazon.in/s?k=${encodeURIComponent('macrame wall hanging set boho')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Persian Pattern Area Rug', price: 4500, link: `https://www.amazon.in/s?k=${encodeURIComponent('persian area rug 5x7')}&tag=5010b3-21`, category: 'Rug' },
      { name: 'Woven Pouf Ottomans (Set of 2)', price: 3200, link: `https://www.amazon.in/s?k=${encodeURIComponent('woven pouf ottoman set')}&tag=5010b3-21`, category: 'Seating' },
    ],
    changes: [
      { title: 'Layer Textiles', description: 'Add 3-5 patterned rugs overlapping on the floor. Mix Persian, Moroccan, and kilim styles for authentic boho vibes.' },
      { title: 'Add Macrame & Wall Decor', description: 'Hang 2-3 macrame pieces on the main wall. Mix with woven baskets and vintage mirrors for dimension.' },
      { title: 'Bring in Plants', description: 'Place 5-7 indoor plants of varying sizes. Use hanging planters near windows and floor pots in corners.' },
    ],
    colors: [{ name: 'Terracotta', hex: '#E2725B' }, { name: 'Mustard', hex: '#D4A017' }, { name: 'Olive', hex: '#808000' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Rust', hex: '#B7410E' }],
  },
  {
    id: 'industrial-loft', caption: 'Industrial Loft', image: 'images/gallery/item2.jpg',
    description: 'Raw and refined industrial loft design with exposed brick walls, steel beam ceilings, large factory windows, and vintage Edison bulb lighting.',
    style: 'Industrial', weekSlot: 'W2', totalBudget: 69000, timeEstimate: '3-4 weekends', difficulty: 'Advanced',
    products: [
      { name: 'Leather Chesterfield Sofa', price: 35000, link: `https://www.amazon.in/s?k=${encodeURIComponent('leather chesterfield sofa 3 seater')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Reclaimed Wood Coffee Table', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('reclaimed wood coffee table industrial')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Edison Bulb Pendant Light', price: 3800, link: `https://www.amazon.in/s?k=${encodeURIComponent('edison bulb pendant light vintage')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Metal Bar Stools (Set of 2)', price: 6000, link: `https://www.amazon.in/s?k=${encodeURIComponent('metal bar stools industrial set of 2')}&tag=5010b3-21`, category: 'Seating' },
    ],
    changes: [
      { title: 'Expose Raw Materials', description: 'Remove plaster to expose brick walls. If not possible, use brick wallpaper or textured paint for similar effect.' },
      { title: 'Install Edison Lighting', description: 'Replace ceiling fixtures with exposed Edison bulb pendants. Use black iron pipe or rope as cord covers.' },
      { title: 'Add Metal Accents', description: 'Introduce wrought iron, steel, and copper elements through furniture legs, shelving brackets, and light fixtures.' },
    ],
    colors: [{ name: 'Concrete Grey', hex: '#989898' }, { name: 'Brick Red', hex: '#A0522D' }, { name: 'Steel Blue', hex: '#4682B4' }, { name: 'Raw Wood', hex: '#8B6914' }, { name: 'Matte Black', hex: '#2B2B2B' }],
  },
  {
    id: 'traditional-indian', caption: 'Traditional Indian', image: 'images/gallery/item3.jpg',
    description: 'A vibrant Indian apartment living room featuring carved wooden furniture, brass accents, colorful textiles, and decorative mirrors.',
    style: 'Traditional Indian', weekSlot: 'W3', totalBudget: 63900, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Carved Sheesham Wood Sofa', price: 28000, link: `https://www.amazon.in/s?k=${encodeURIComponent('carved sheesham wood sofa set')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Brass Urli Bowl', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('brass urli bowl decorative')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Handwoven Dhurrie Rug', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('handwoven dhurrie rug indian')}&tag=5010b3-21`, category: 'Rug' },
      { name: 'Decorative Brass Mirror', price: 4200, link: `https://www.amazon.in/s?k=${encodeURIComponent('decorative brass wall mirror round')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Add Carved Wood Furniture', description: 'Replace modern furniture with sheesham or teak pieces featuring traditional Indian carvings and inlay work.' },
      { title: 'Layer Indian Textiles', description: 'Use silk, brocade, and block-printed fabrics for cushions, throws, and curtains. Mix patterns confidently.' },
      { title: 'Incorporate Brass & Copper', description: 'Add brass urli bowls, copper planters, and metal artifacts as table and shelf decor.' },
    ],
    colors: [{ name: 'Marigold', hex: '#F4A460' }, { name: 'Teal', hex: '#008080' }, { name: 'Deep Red', hex: '#C41E3A' }, { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Saffron', hex: '#F4C430' }],
  },
  {
    id: 'smart-home', caption: 'Smart Home Living', image: 'images/gallery/item4.jpg',
    description: 'A futuristic smart home living room with sleek white entertainment units, hidden LED strip lighting, automated curtains, and integrated technology.',
    style: 'Smart Home', weekSlot: 'W4', totalBudget: 57500, timeEstimate: '1-2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Smart LED Strip Lights', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('smart LED strip lights RGB wifi')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Motorized Curtain Rod', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('motorized curtain rod automatic')}&tag=5010b3-21`, category: 'Automation' },
      { name: 'Smart Speaker System', price: 12000, link: `https://www.amazon.in/s?k=${encodeURIComponent('smart speaker home system echo')}&tag=5010b3-21`, category: 'Tech' },
      { name: 'White Entertainment Unit', price: 15000, link: `https://www.amazon.in/s?k=${encodeURIComponent('white entertainment unit TV cabinet')}&tag=5010b3-21`, category: 'Furniture' },
    ],
    changes: [
      { title: 'Install LED Strip Lighting', description: 'Add RGB LED strips behind the TV unit, under shelves, and along ceiling coves. Use app-controlled strips.' },
      { title: 'Automate Curtains', description: 'Replace manual curtain rods with motorized ones. Schedule open/close times via smartphone app.' },
      { title: 'Centralize Entertainment', description: 'Get a sleek white entertainment unit with cable management. Mount TV with hidden wiring.' },
    ],
    colors: [{ name: 'Pure White', hex: '#FAFAFA' }, { name: 'Arctic Blue', hex: '#E0F2F7' }, { name: 'Graphite', hex: '#474747' }, { name: 'Silver', hex: '#C0C0C0' }, { name: 'Neon Accent', hex: '#39FF14' }],
  },
  {
    id: 'small-bedroom', caption: 'Small Bedroom Makeover', image: 'images/gallery/item5.jpg',
    description: 'A clever small bedroom transformation using space-saving furniture, floating shelves, warm string lights, and a compact workspace corner.',
    style: 'Scandinavian', weekSlot: 'W1', totalBudget: 33000, timeEstimate: '1-2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Storage Bed with Drawers', price: 18000, link: `https://www.amazon.in/s?k=${encodeURIComponent('storage bed queen size with drawers')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Floating Wall Shelves (Set)', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('floating wall shelves set of 3')}&tag=5010b3-21`, category: 'Storage' },
      { name: 'LED String Lights', price: 800, link: `https://www.amazon.in/s?k=${encodeURIComponent('LED string lights warm white bedroom')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Full-Length Mirror', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('full length mirror wall mounted')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Use Multi-Functional Furniture', description: 'Get a storage bed with drawers underneath. Use a foldable wall desk that disappears when not needed.' },
      { title: 'Install Floating Shelves', description: 'Replace floor-standing bookshelves with floating wall shelves. Keep the floor clear to make the room feel bigger.' },
      { title: 'Add a Large Mirror', description: 'Place a full-length mirror on one wall. It reflects light and creates the illusion of double the space.' },
    ],
    colors: [{ name: 'Warm White', hex: '#F5F2EA' }, { name: 'Soft Grey', hex: '#D3D3D3' }, { name: 'Blush Pink', hex: '#F4C2C2' }, { name: 'Light Wood', hex: '#DEB887' }, { name: 'Sage Green', hex: '#9DC183' }],
  },
  {
    id: 'modern-kitchen', caption: 'Modern Kitchen', image: 'images/gallery/item6.jpg',
    description: 'A stunning kitchen renovation featuring white cabinets with gold handles, marble countertops, a functional kitchen island with bar stools, and elegant pendant lighting.',
    style: 'Modern', weekSlot: 'W2', totalBudget: 65700, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Kitchen Island with Marble Top', price: 35000, link: `https://www.amazon.in/s?k=${encodeURIComponent('kitchen island marble top movable')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Bar Stools with Gold Legs (Set of 2)', price: 8000, link: `https://www.amazon.in/s?k=${encodeURIComponent('bar stools gold legs velvet set of 2')}&tag=5010b3-21`, category: 'Seating' },
      { name: 'Glass Pendant Lights (Set of 3)', price: 4500, link: `https://www.amazon.in/s?k=${encodeURIComponent('glass pendant lights kitchen island set of 3')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Ceramic Dinner Set (24 pcs)', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('ceramic dinner set 24 pieces white')}&tag=5010b3-21`, category: 'Tableware' },
    ],
    changes: [
      { title: 'Upgrade Cabinet Hardware', description: 'Replace old handles with brushed gold or brass ones. Instant luxury upgrade for under Rs.2,000.' },
      { title: 'Add a Kitchen Island', description: 'Install a freestanding island with storage. Use it as prep space, breakfast bar, and extra storage.' },
      { title: 'Install Pendant Lighting', description: 'Hang 2-3 glass or copper pendant lights above the island. Creates a focal point and task lighting.' },
    ],
    colors: [{ name: 'Pure White', hex: '#FFFFFF' }, { name: 'Carrara Marble', hex: '#F0EFEA' }, { name: 'Brushed Gold', hex: '#C9A961' }, { name: 'Soft Grey', hex: '#B0B0B0' }, { name: 'Sage Green', hex: '#A8BFA3' }],
  },
  {
    id: 'home-office', caption: 'Home Office Design', image: 'images/gallery/item7.jpg',
    description: 'A productive and stylish home office featuring a wooden desk with an ergonomic chair, floor-to-ceiling bookshelf, large window with natural light, indoor plants, and minimalist wall art.',
    style: 'Japandi', weekSlot: 'W3', totalBudget: 62700, timeEstimate: '1-2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Standing Desk (Motorized)', price: 22000, link: `https://www.amazon.in/s?k=${encodeURIComponent('motorized standing desk electric height adjustable')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Ergonomic Mesh Chair', price: 15000, link: `https://www.amazon.in/s?k=${encodeURIComponent('ergonomic mesh office chair lumbar support')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'LED Desk Lamp with Wireless Charge', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('LED desk lamp wireless charger USB')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Tall Bookshelf (5-tier)', price: 8000, link: `https://www.amazon.in/s?k=${encodeURIComponent('tall bookshelf 5 tier wooden industrial')}&tag=5010b3-21`, category: 'Storage' },
    ],
    changes: [
      { title: 'Invest in Ergonomics', description: 'Get a motorized standing desk and ergonomic chair. Alternate between sitting and standing throughout the day.' },
      { title: 'Maximize Natural Light', description: 'Position the desk perpendicular to the window. Use sheer curtains to diffuse harsh direct sunlight.' },
      { title: 'Add a Bookshelf', description: 'Install a tall bookshelf for storage and visual backdrop. Mix books with decor items and plants.' },
    ],
    colors: [{ name: 'Warm White', hex: '#F5F2EA' }, { name: 'Walnut Brown', hex: '#6B4F3A' }, { name: 'Sage Green', hex: '#A8BFA3' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Beige', hex: '#E8DCC8' }],
  },
  {
    id: 'teen-bedroom', caption: 'Teen Bedroom Ideas', image: 'images/gallery/item8.jpg',
    description: 'A trendy teen bedroom featuring neon LED signs, colorful bedding, a gaming desk setup, polaroid photo walls, and fun decorative elements.',
    style: 'Eclectic', weekSlot: 'W4', totalBudget: 27000, timeEstimate: '1 weekend', difficulty: 'Easy',
    products: [
      { name: 'Neon LED Name Sign', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('custom neon LED sign name bedroom')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'RGB LED Strip (5m)', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('RGB LED strip lights 5m bluetooth app control')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Gaming Desk Setup', price: 12000, link: `https://www.amazon.in/s?k=${encodeURIComponent('gaming desk setup LED carbon fiber')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Bean Bag Chair', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('bean bag chair XXXL with filling')}&tag=5010b3-21`, category: 'Seating' },
    ],
    changes: [
      { title: 'Create a Feature Wall', description: 'Use a tapestry, removable wallpaper, or a photo collage as a statement wall behind the bed.' },
      { title: 'Add Neon & LED Accents', description: 'Install a custom neon name sign and RGB LED strips behind the desk and bed for trendy ambient lighting.' },
      { title: 'Set Up a Gaming/Study Zone', description: 'Dedicate one corner to a gaming desk with proper cable management, dual monitor setup, and ergonomic chair.' },
    ],
    colors: [{ name: 'Electric Pink', hex: '#FF10F0' }, { name: 'Neon Blue', hex: '#00FFFF' }, { name: 'Purple Haze', hex: '#BF40BF' }, { name: 'Black', hex: '#1A1A1A' }, { name: 'Soft Lavender', hex: '#E6E6FA' }],
  },
  {
    id: 'tv-wall', caption: 'TV Wall Design', image: 'images/gallery/item9.jpg',
    description: 'An elegant TV wall design featuring chevron wood paneling, ambient backlighting, floating shelves with curated decor, and a sleek media console.',
    style: 'Modern', weekSlot: 'W1', totalBudget: 31100, timeEstimate: '1-2 weekends', difficulty: 'Medium',
    products: [
      { name: 'Chevron Wood Wall Panels', price: 8000, link: `https://www.amazon.in/s?k=${encodeURIComponent('chevron wood wall panels 3D adhesive')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'TV Backlight LED Kit', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('TV backlight LED kit USB powered')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Floating TV Console', price: 12000, link: `https://www.amazon.in/s?k=${encodeURIComponent('floating TV console wall mounted media unit')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Ambient Wall Sconces (Pair)', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('ambient wall sconces pair modern gold')}&tag=5010b3-21`, category: 'Lighting' },
    ],
    changes: [
      { title: 'Add Wood Paneling', description: 'Install chevron, slat, or geometric wood panels behind the TV. Creates instant texture and warmth.' },
      { title: 'Install TV Backlight', description: 'Add an LED backlight kit behind the TV. Reduces eye strain and creates a cinema-like experience.' },
      { title: 'Mount a Floating Console', description: 'Replace the floor TV unit with a wall-mounted floating console. Makes the room feel more spacious.' },
    ],
    colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Warm Oak', hex: '#C4A484' }, { name: 'Soft White', hex: '#F5F5F0' }, { name: 'Matte Black', hex: '#2B2B2B' }, { name: 'Brass', hex: '#B5A642' }],
  },
  {
    id: 'art-deco', caption: 'Art Deco Glamour', image: 'images/gallery/artdeco.jpg',
    description: 'Luxurious Art Deco living room with geometric patterns, gold accents, velvet upholstery, and statement lighting fixtures that evoke 1920s Hollywood glamour.',
    style: 'Art Deco', weekSlot: 'W2', totalBudget: 85000, timeEstimate: '3-4 weekends', difficulty: 'Advanced',
    products: [
      { name: 'Velvet Chesterfield Sofa', price: 45000, link: `https://www.amazon.in/s?k=${encodeURIComponent('velvet chesterfield sofa emerald green')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Gold Geometric Mirror', price: 5500, link: `https://www.amazon.in/s?k=${encodeURIComponent('gold geometric wall mirror art deco')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Crystal Chandelier', price: 12000, link: `https://www.amazon.in/s?k=${encodeURIComponent('crystal chandelier art deco small')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Marble & Gold Side Table', price: 8000, link: `https://www.amazon.in/s?k=${encodeURIComponent('marble side table gold legs round')}&tag=5010b3-21`, category: 'Furniture' },
    ],
    changes: [
      { title: 'Add Geometric Patterns', description: 'Use wallpaper or stencils with bold geometric patterns on feature walls. Think zigzags, sunbursts, and chevrons.' },
      { title: 'Install Statement Lighting', description: 'A crystal or brass chandelier is the crown jewel. Choose one with geometric crystal arrangements.' },
      { title: 'Use Luxurious Materials', description: 'Velvet sofas, marble tables, and brass accents. Art Deco is all about opulence and rich materials.' },
    ],
    colors: [{ name: 'Emerald', hex: '#2D5A3D' }, { name: 'Gold', hex: '#C9A961' }, { name: 'Jet Black', hex: '#1A1A1A' }, { name: 'Blush', hex: '#E8C4C4' }, { name: 'Navy', hex: '#1B2A4A' }],
  },
  {
    id: 'coastal', caption: 'Coastal Beach House', image: 'images/gallery/coastal.jpg',
    description: 'A breezy coastal living room with whitewashed wood, navy and white stripes, natural jute rugs, seashell decor, and plenty of natural light streaming through sheer curtains.',
    style: 'Coastal', weekSlot: 'W3', totalBudget: 42000, timeEstimate: '2-3 weekends', difficulty: 'Easy',
    products: [
      { name: 'Slipcovered Linen Sofa', price: 28000, link: `https://www.amazon.in/s?k=${encodeURIComponent('linen slipcovered sofa white coastal')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Jute Area Rug', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('jute area rug 5x7 natural fiber')}&tag=5010b3-21`, category: 'Rug' },
      { name: 'Rope Table Lamp', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('rope table lamp nautical coastal')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Striped Throw Pillows (Set)', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('navy white striped throw pillows set')}&tag=5010b3-21`, category: 'Textiles' },
    ],
    changes: [
      { title: 'Whitewash Everything', description: 'Paint walls, furniture, and shelves in white or soft cream. The coastal look starts with a bright, airy base.' },
      { title: 'Add Natural Fiber Rugs', description: 'Layer jute or sisal rugs for texture. They bring in the natural beach element underfoot.' },
      { title: 'Use Nautical Accents', description: 'Decorate with rope, shells, driftwood, and navy stripes. Keep it subtle — one or two pieces per surface.' },
    ],
    colors: [{ name: 'Seafoam', hex: '#A8D5BA' }, { name: 'Navy', hex: '#1B3A5C' }, { name: 'Sand', hex: '#E8DCC8' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Driftwood', hex: '#B5A48A' }],
  },
  {
    id: 'farmhouse', caption: 'Modern Farmhouse', image: 'images/gallery/farmhouse.jpg',
    description: 'A cozy modern farmhouse living room with shiplap walls, a large sectional sofa, rustic wood coffee table, galvanized metal accents, and warm neutral textiles.',
    style: 'Farmhouse', weekSlot: 'W4', totalBudget: 55000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Large L-Shaped Sectional', price: 35000, link: `https://www.amazon.in/s?k=${encodeURIComponent('L shaped sectional sofa grey fabric')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Rustic Wood Coffee Table', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('rustic wood coffee table farmhouse')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Shiplap Wallpaper', price: 3000, link: `https://www.amazon.in/s?k=${encodeURIComponent('shiplap peel stick wallpaper white')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Galvanized Metal Planters', price: 1500, link: `https://www.amazon.in/s?k=${encodeURIComponent('galvanized metal planters set farmhouse')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Install Shiplap', description: 'Add shiplap or beadboard to one accent wall. Use peel-and-stick options for a rental-friendly solution.' },
      { title: 'Mix Wood Tones', description: 'Combine light and dark wood furniture. The contrast adds depth and the rustic charm farmhouse is known for.' },
      { title: 'Add Cozy Textiles', description: 'Layer chunky knit throws, plaid pillows, and faux fur rugs. Farmhouse is all about comfort and warmth.' },
    ],
    colors: [{ name: 'Cream', hex: '#FFFDD0' }, { name: 'Sage', hex: '#9DC183' }, { name: 'Barn Red', hex: '#7C0A02' }, { name: 'Warm Grey', hex: '#B0B0B0' }, { name: 'Natural Wood', hex: '#C4A484' }],
  },
  {
    id: 'moroccan', caption: 'Moroccan Riad', image: 'images/gallery/moroccan.jpg',
    description: 'An exotic Moroccan-inspired living space with intricate tile patterns, arched doorways, colorful lanterns, low seating with plush cushions, and ornate brass accents.',
    style: 'Moroccan', weekSlot: 'W1', totalBudget: 48000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Moroccan Poufs (Set of 2)', price: 4500, link: `https://www.amazon.in/s?k=${encodeURIComponent('moroccan leather pouf ottoman set')}&tag=5010b3-21`, category: 'Seating' },
      { name: 'Colorful Lantern Pendant', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('moroccan lantern pendant light colorful')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Beni Ourain Style Rug', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('beni ourain style rug shag moroccan')}&tag=5010b3-21`, category: 'Rug' },
      { name: 'Tile Pattern Wallpaper', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('moroccan tile peel stick wallpaper')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Layer Moroccan Rugs', description: 'Place a large Beni Ourain-style rug as the base, then layer smaller kilim rugs on top for a collected feel.' },
      { title: 'Hang Colorful Lanterns', description: 'Install 2-3 Moroccan lanterns at varying heights. They create beautiful light patterns when lit.' },
      { title: 'Create Low Seating', description: 'Use floor cushions, poufs, and a low wooden table instead of traditional sofa seating for an authentic riad feel.' },
    ],
    colors: [{ name: 'Majorelle Blue', hex: '#1E4D8C' }, { name: 'Terracotta', hex: '#E2725B' }, { name: 'Gold', hex: '#C9A961' }, { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Emerald', hex: '#2D5A3D' }],
  },
  {
    id: 'zen', caption: 'Zen Minimalist', image: 'images/gallery/zen.jpg',
    description: 'A serene Zen-inspired space with clean lines, natural materials, a low platform bed, tatami mat flooring, shoji screens, and a single ikebana floral arrangement.',
    style: 'Zen', weekSlot: 'W2', totalBudget: 35000, timeEstimate: '2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Low Platform Bed Frame', price: 18000, link: `https://www.amazon.in/s?k=${encodeURIComponent('low platform bed frame wooden japanese')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Shoji Room Divider', price: 4500, link: `https://www.amazon.in/s?k=${encodeURIComponent('shoji screen room divider japanese')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Tatami Floor Mat', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('tatami mat floor japanese style')}&tag=5010b3-21`, category: 'Rug' },
      { name: 'Ceramic Ikebana Vase', price: 1200, link: `https://www.amazon.in/s?k=${encodeURIComponent('ikebana ceramic vase japanese minimalist')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Declutter Completely', description: 'Zen philosophy values empty space. Remove everything non-essential. Keep only what is beautiful or useful.' },
      { title: 'Use Natural Materials', description: 'Wood, stone, cotton, and linen. Avoid synthetic materials. The texture should feel organic and imperfect.' },
      { title: 'Add a Meditation Corner', description: 'Dedicate a small area with a zafu cushion, incense holder, and perhaps a small Buddha statue or stone garden.' },
    ],
    colors: [{ name: 'Rice Paper', hex: '#F0EDE5' }, { name: 'Bamboo', hex: '#C8A951' }, { name: 'Stone Grey', hex: '#8C8C8C' }, { name: 'Charcoal Ink', hex: '#2C2C2C' }, { name: 'Moss Green', hex: '#7A8B6F' }],
  },
  {
    id: 'tropical', caption: 'Tropical Paradise', image: 'images/gallery/tropical.jpg',
    description: 'A lush tropical living room with large monstera and palm plants, bamboo furniture, vibrant green and coral accents, rattan light fixtures, and breezy linen curtains.',
    style: 'Tropical', weekSlot: 'W3', totalBudget: 38000, timeEstimate: '1-2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Bamboo Sofa Set', price: 22000, link: `https://www.amazon.in/s?k=${encodeURIComponent('bamboo sofa set 2 seater natural')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Monstera Plant (Large)', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('monstera plant large indoor live')}&tag=5010b3-21`, category: 'Plants' },
      { name: 'Rattan Pendant Light', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('rattan pendant light woven basket')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Linen Curtains (White)', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('linen curtains white sheer breezy')}&tag=5010b3-21`, category: 'Textiles' },
    ],
    changes: [
      { title: 'Go Big with Plants', description: 'Add 5-8 large indoor plants: monstera, fiddle leaf fig, bird of paradise, and palms. Cluster in corners and near windows.' },
      { title: 'Use Natural Weaves', description: 'Rattan, bamboo, and wicker furniture and accessories. The woven texture defines the tropical aesthetic.' },
      { title: 'Add Pops of Color', description: 'Use coral, teal, and sunny yellow as accent colors in cushions, throws, and artwork against a neutral base.' },
    ],
    colors: [{ name: 'Palm Green', hex: '#2D5A27' }, { name: 'Coral', hex: '#FF7F50' }, { name: 'Sand', hex: '#E8DCC8' }, { name: 'Turquoise', hex: '#40E0D0' }, { name: 'Bamboo', hex: '#C8A951' }],
  },
  {
    id: 'midcentury', caption: 'Mid-Century Modern', image: 'images/gallery/midcentury.jpg',
    description: 'A classic mid-century modern living room with tapered leg furniture, a statement credenza, atomic starburst clock, warm wood tones, and retro color accents.',
    style: 'Mid-Century', weekSlot: 'W4', totalBudget: 62000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Mid-Century Sofa (Tufted)', price: 32000, link: `https://www.amazon.in/s?k=${encodeURIComponent('mid century modern sofa tufted grey')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Teak Wood Credenza', price: 15000, link: `https://www.amazon.in/s?k=${encodeURIComponent('teak credenza mid century modern sideboard')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Starburst Wall Clock', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('starburst wall clock mid century gold')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Tapered Leg Coffee Table', price: 8000, link: `https://www.amazon.in/s?k=${encodeURIComponent('tapered leg coffee table walnut mid century')}&tag=5010b3-21`, category: 'Furniture' },
    ],
    changes: [
      { title: 'Choose Tapered Legs', description: 'Furniture with thin, tapered wooden legs is the signature look. Avoid bulky, ground-hugging pieces.' },
      { title: 'Add a Statement Credenza', description: 'A teak or walnut credenza is the anchor piece. Style it with a few curated objects and a large mirror or art above.' },
      { title: 'Use Retro Colors', description: 'Mustard, avocado, burnt orange, and teal as accent colors. Keep the main pieces neutral (grey, cream, wood tones).' },
    ],
    colors: [{ name: 'Mustard', hex: '#D4A017' }, { name: 'Avocado', hex: '#568203' }, { name: 'Walnut', hex: '#6B4F3A' }, { name: 'Burnt Orange', hex: '#CC5500' }, { name: 'Teal', hex: '#008080' }],
  },
  {
    id: 'french-country', caption: 'French Country', image: 'images/gallery/frenchcountry.jpg',
    description: 'A romantic French country living room with distressed white furniture, toile fabric, crystal chandelier, fresh flowers, and ornate gilt mirrors.',
    style: 'French Country', weekSlot: 'W1', totalBudget: 58000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Distressed White Armchair', price: 18000, link: `https://www.amazon.in/s?k=${encodeURIComponent('distressed white armchair french country')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Toile De Jouy Curtains', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('toile curtains french country blue white')}&tag=5010b3-21`, category: 'Textiles' },
      { name: 'Crystal Chandelier (Mini)', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('mini crystal chandelier french style')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Ornate Gilt Mirror', price: 6500, link: `https://www.amazon.in/s?k=${encodeURIComponent('ornate gold wall mirror french vintage')}&tag=5010b3-21`, category: 'Decor' },
    ],
    changes: [
      { title: 'Distress Your Furniture', description: 'Paint wood furniture in white or soft blue, then sand edges for a weathered, timeworn look.' },
      { title: 'Use Toile Fabric', description: 'Add toile de Jouy patterns through curtains, cushions, or upholstery. The scenic prints are quintessentially French.' },
      { title: 'Fresh Flowers Always', description: 'Keep fresh flowers in a crystal vase. Lavender, roses, and peonies in soft pastels complete the romantic feel.' },
    ],
    colors: [{ name: 'Provence Blue', hex: '#7B9ECF' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Soft Pink', hex: '#F4C2C2' }, { name: 'Sage', hex: '#9DC183' }],
  },
  {
    id: 'rustic', caption: 'Rustic Cabin', image: 'images/gallery/rustic.jpg',
    description: 'A warm rustic cabin living room with exposed log walls, a stone fireplace, thick woolen throws, antler decor, leather armchairs, and warm amber lighting.',
    style: 'Rustic', weekSlot: 'W2', totalBudget: 45000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Leather Armchair (Distressed)', price: 22000, link: `https://www.amazon.in/s?k=${encodeURIComponent('distressed leather armchair vintage brown')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Thick Woolen Throw Blanket', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('thick woolen throw blanket herringbone')}&tag=5010b3-21`, category: 'Textiles' },
      { name: 'Antler Wall Decor', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('antler wall decor rustic faux')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Amber Glass Table Lamp', price: 2800, link: `https://www.amazon.in/s?k=${encodeURIComponent('amber glass table lamp vintage rustic')}&tag=5010b3-21`, category: 'Lighting' },
    ],
    changes: [
      { title: 'Embrace Raw Wood', description: 'Use unfinished or lightly finished wood. The knots, grains, and imperfections are what make rustic beautiful.' },
      { title: 'Layer Thick Textiles', description: 'Wool, faux fur, and chunky knit blankets and pillows. The cozier and heavier, the better for rustic charm.' },
      { title: 'Add Nature-Inspired Decor', description: 'Antlers, pinecones, driftwood, and stone elements. Bring the outdoors in with organic, unpolished pieces.' },
    ],
    colors: [{ name: 'Bark Brown', hex: '#6B4F3A' }, { name: 'Forest Green', hex: '#2D5A27' }, { name: 'Rust', hex: '#B7410E' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Charcoal', hex: '#36454F' }],
  },
  {
    id: 'korean', caption: 'Korean Minimalist', image: 'images/gallery/korean.jpg',
    description: 'A serene Korean-inspired interior with low wooden furniture, clean white walls, natural linen textiles, ceramic pottery, and carefully curated negative space.',
    style: 'Korean', weekSlot: 'W3', totalBudget: 32000, timeEstimate: '1-2 weekends', difficulty: 'Easy',
    products: [
      { name: 'Low Korean Tea Table', price: 6500, link: `https://www.amazon.in/s?k=${encodeURIComponent('low korean tea table wooden')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Linen Floor Cushions (Set)', price: 2500, link: `https://www.amazon.in/s?k=${encodeURIComponent('linen floor cushions korean style set')}&tag=5010b3-21`, category: 'Seating' },
      { name: 'White Ceramic Pottery Set', price: 1800, link: `https://www.amazon.in/s?k=${encodeURIComponent('white ceramic pottery set minimalist')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Natural Linen Bedding/Throw', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('linen throw blanket natural beige')}&tag=5010b3-21`, category: 'Textiles' },
    ],
    changes: [
      { title: 'Go Low', description: 'Use low-profile furniture close to the ground. Korean interiors prioritize connection with the floor.' },
      { title: 'Curate Negative Space', description: 'Leave walls mostly bare. Display one or two carefully chosen ceramic pieces rather than filling every surface.' },
      { title: 'Use Natural Fabrics', description: 'Linen, cotton, and hemp in undyed natural tones. The texture and slight imperfection of handwoven fabric adds warmth.' },
    ],
    colors: [{ name: 'Rice White', hex: '#F5F5F0' }, { name: 'Raw Linen', hex: '#D6C6B0' }, { name: 'Warm Wood', hex: '#C4A484' }, { name: 'Soft Clay', hex: '#C9B8A0' }, { name: 'Moss', hex: '#7A8B6F' }],
  },
  {
    id: 'mediterranean', caption: 'Mediterranean Villa', image: 'images/gallery/mediterranean.jpg',
    description: 'A sun-drenched Mediterranean living room with white plastered walls, blue accents, terracotta pottery, wrought iron details, arched windows, and fresh olive branches.',
    style: 'Mediterranean', weekSlot: 'W4', totalBudget: 52000, timeEstimate: '2-3 weekends', difficulty: 'Medium',
    products: [
      { name: 'Wrought Iron Coffee Table', price: 12000, link: `https://www.amazon.in/s?k=${encodeURIComponent('wrought iron coffee table mediterranean')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Terracotta Pot Set (Large)', price: 3500, link: `https://www.amazon.in/s?k=${encodeURIComponent('terracotta pots large set mediterranean')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Blue & White Ceramic Vases', price: 2800, link: `https://www.amazon.in/s?k=${encodeURIComponent('blue white ceramic vases greek mediterranean')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Linen Slipcovered Sofa', price: 25000, link: `https://www.amazon.in/s?k=${encodeURIComponent('linen slipcovered sofa white mediterranean')}&tag=5010b3-21`, category: 'Furniture' },
    ],
    changes: [
      { title: 'Whitewash Walls', description: 'Paint walls in warm white or soft cream. Mediterranean interiors are bright and reflect the sun.' },
      { title: 'Add Blue Accents', description: 'Use deep blue (Greek blue) for doors, window frames, or decorative ceramics. It evokes the sea and sky.' },
      { title: 'Use Wrought Iron & Terracotta', description: 'Wrought iron furniture, terracotta pots, and ceramic tiles are Mediterranean staples. They add warmth and old-world charm.' },
    ],
    colors: [{ name: 'Santorini Blue', hex: '#1B5C8D' }, { name: 'Whitewash', hex: '#F5F5F0' }, { name: 'Terracotta', hex: '#E2725B' }, { name: 'Olive Green', hex: '#6B8E23' }, { name: 'Sunset Gold', hex: '#C9A961' }],
  },
  {
    id: 'contemporary', caption: 'Contemporary Chic', image: 'images/gallery/contemporary.jpg',
    description: 'A sleek contemporary living space with bold geometric shapes, mixed metals, abstract art, sculptural furniture, and a neutral palette with strategic pops of color.',
    style: 'Contemporary', weekSlot: 'W1', totalBudget: 72000, timeEstimate: '3-4 weekends', difficulty: 'Advanced',
    products: [
      { name: 'Sculptural Accent Chair', price: 25000, link: `https://www.amazon.in/s?k=${encodeURIComponent('sculptural accent chair modern contemporary')}&tag=5010b3-21`, category: 'Furniture' },
      { name: 'Abstract Canvas Art (Large)', price: 5500, link: `https://www.amazon.in/s?k=${encodeURIComponent('abstract canvas wall art large modern')}&tag=5010b3-21`, category: 'Decor' },
      { name: 'Mixed Metal Floor Lamp', price: 6500, link: `https://www.amazon.in/s?k=${encodeURIComponent('mixed metal floor lamp contemporary brass')}&tag=5010b3-21`, category: 'Lighting' },
      { name: 'Geometric Area Rug', price: 8500, link: `https://www.amazon.in/s?k=${encodeURIComponent('geometric area rug modern abstract 5x7')}&tag=5010b3-21`, category: 'Rug' },
    ],
    changes: [
      { title: 'Mix Metals Freely', description: 'Combine brass, chrome, and matte black metals in lighting and accessories. Contemporary design breaks the "one metal" rule.' },
      { title: 'Add Sculptural Furniture', description: 'Choose pieces with interesting shapes and curves. A sculptural chair or table doubles as art.' },
      { title: 'Use Large-Scale Art', description: 'One oversized abstract piece makes more impact than a gallery wall. Keep frames minimal or frameless.' },
    ],
    colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Blush', hex: '#E8C4C4' }, { name: 'Brass', hex: '#C9A961' }, { name: 'Cream', hex: '#F5F5F0' }, { name: 'Navy', hex: '#1B2A4A' }],
  },
];

// Convert static items to the format the gallery expects
function getStaticFallbackItems(): any[] {
  return staticGalleryItems.map((item) => ({
    id: item.id,
    caption: item.caption,
    description: item.description,
    image: item.image,
    style: item.style,
    weekSlot: item.weekSlot,
    totalBudget: item.totalBudget,
    timeEstimate: item.timeEstimate,
    difficulty: item.difficulty,
    products: item.products,
    changes: item.changes,
    colors: item.colors,
  }));
}

export default function ImageGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryDetail | null>(null);
  const [activeWeek, setActiveWeek] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from backend
  const allItemsQuery = trpc.gallery.listAll.useQuery();
  const weekQuery = trpc.gallery.listByWeek.useQuery(
    activeWeek !== 'ALL' ? { weekSlot: activeWeek } : undefined,
    { enabled: activeWeek !== 'ALL' }
  );
  const weekSlotsQuery = trpc.gallery.getWeekSlots.useQuery();

  // Live trends — used to badge cards whose style matches a top trend
  const trendsQuery = trpc.trends.current.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const topTrends = trendsQuery.data?.topTrends ?? [];

  // Match a gallery item against the ranked trend list.
  // Returns the lowest (best) rank whose keyword tokens all appear in the item.
  function findTrendRank(item: any): { rank: number; keyword: string } | null {
    if (!topTrends.length) return null;
    const haystack = `${item.caption || ''} ${item.style || ''} ${item.description || ''}`.toLowerCase();
    for (let i = 0; i < topTrends.length; i++) {
      const kw = topTrends[i].keyword.toLowerCase();
      const tokens = kw.split(/\s+/).filter((t: string) => t.length > 2);
      if (tokens.length === 0) continue;
      if (tokens.every((t: string) => haystack.includes(t))) {
        return { rank: i + 1, keyword: topTrends[i].keyword };
      }
    }
    return null;
  }

  // Use API data with static fallback
  const apiItems = allItemsQuery.data ?? [];
  const weekItems = weekQuery.data?.items ?? [];
  const apiWeekSlots = weekSlotsQuery.data ?? ['W1', 'W2', 'W3', 'W4'];

  // FALLBACK: use static data when API returns nothing (static hosting)
  const allItems = apiItems.length > 0 ? apiItems : getStaticFallbackItems();
  const weekSlots = apiItems.length > 0 ? apiWeekSlots : ['W1', 'W2', 'W3', 'W4'];
  // When using static fallback, filter locally by week slot
  const items = activeWeek === 'ALL'
    ? allItems
    : (apiItems.length > 0 ? weekItems : allItems.filter((item: any) => item.weekSlot === activeWeek));

  // Filter by search query
  const filteredItems = searchQuery.trim()
    ? items.filter((item: any) =>
        item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const isLoading = apiItems.length > 0 && (allItemsQuery.isLoading || (activeWeek !== 'ALL' && weekQuery.isLoading));

  // Scroll animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.gallery-card');
    const triggers: ScrollTrigger[] = [];

    cards.forEach((card) => {
      const anim = gsap.fromTo(
        card,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
        }
      );
      if (anim.scrollTrigger) {
        triggers.push(anim.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [filteredItems]);

  // Listen for footer link clicks
  useEffect(() => {
    const handleFilterWeek = (e: Event) => {
      const week = (e as CustomEvent).detail as string;
      setActiveWeek(week);
      setSearchQuery('');
      const el = document.getElementById('waves-gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('galleryFilterWeek', handleFilterWeek);
    return () => window.removeEventListener('galleryFilterWeek', handleFilterWeek);
  }, []);

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const week = params.get('galleryWeek');
    if (week && ['W1', 'W2', 'W3', 'W4'].includes(week)) {
      setActiveWeek(week);
      params.delete('galleryWeek');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const openDetail = (item: any) => {
    setSelectedItem({
      caption: item.caption,
      description: item.description ?? '',
      image: item.image,
      products: (item.products as GalleryDetail['products']) ?? [],
      changes: (item.changes as GalleryDetail['changes']) ?? [],
      colors: (item.colors as GalleryDetail['colors']) ?? [],
      totalBudget: Number(item.totalBudget),
      timeEstimate: item.timeEstimate ?? '',
      difficulty: (item.difficulty as GalleryDetail['difficulty']) ?? 'Medium',
    });
  };

  return (
    <>
      <section
        id="waves-gallery"
        ref={sectionRef}
        style={{
          background: '#0a0a0b',
          padding: '12rem var(--page-padding)',
        }}
      >
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          {galleryConfig.sectionLabel && (
            <div className="section-label" style={{ marginBottom: '2rem' }}>
              {galleryConfig.sectionLabel}
            </div>
          )}
          {galleryConfig.sectionTitle && (
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                color: '#ffffff',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
              }}
            >
              {galleryConfig.sectionTitle}
            </h2>
          )}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: '#888',
              marginTop: '1rem',
              maxWidth: '520px',
              margin: '1rem auto 0',
              lineHeight: 1.6,
            }}
          >
            {allItems.length} interior design styles with product recommendations,
            color palettes, and step-by-step change guides
          </p>
        </div>

        {/* Search Bar */}
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto 2rem',
            position: 'relative',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search styles: boho, kitchen, bedroom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(242,91,41,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Week Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => { setActiveWeek('ALL'); setSearchQuery(''); }}
            style={{
              padding: '10px 22px',
              borderRadius: '20px',
              border: activeWeek === 'ALL'
                ? '1px solid #f25b29'
                : '1px solid rgba(255,255,255,0.1)',
              background: activeWeek === 'ALL'
                ? 'rgba(242,91,41,0.12)'
                : 'rgba(255,255,255,0.03)',
              color: activeWeek === 'ALL' ? '#f25b29' : '#888',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            All ({allItems.length})
          </button>

          {weekSlots.map((slot: string) => {
            const count = allItems.filter((i: any) => i.weekSlot === slot).length;
            return (
              <button
                key={slot}
                onClick={() => { setActiveWeek(slot); setSearchQuery(''); }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '20px',
                  border: activeWeek === slot
                    ? '1px solid #f25b29'
                    : '1px solid rgba(255,255,255,0.1)',
                  background: activeWeek === slot
                    ? 'rgba(242,91,41,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  color: activeWeek === slot ? '#f25b29' : '#888',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {weekLabels[slot] || slot} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {(searchQuery || activeWeek !== 'ALL') && (
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: '#666',
              marginBottom: '1.5rem',
            }}
          >
            Showing {filteredItems.length} of {items.length} styles
            {searchQuery && (
              <span> matching &ldquo;{searchQuery}&rdquo;</span>
            )}
            {activeWeek !== 'ALL' && !searchQuery && (
              <span> from {weekLabels[activeWeek]}</span>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        <div
          className="mx-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
            width: '90vw',
            maxWidth: '1400px',
          }}
        >
          {filteredItems.map((item: any, i: number) => {
            const trendMatch = findTrendRank(item);
            return (
            <div
              key={item.id ?? i}
              className="gallery-card"
              style={{ opacity: 0, cursor: 'pointer' }}
              onClick={() => openDetail(item)}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="transition-transform duration-500"
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.03)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#f25b29',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {weekLabels[item.weekSlot] || item.weekSlot}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {item.difficulty}
                </div>
                {trendMatch && (
                  <div
                    title={`Trending #${trendMatch.rank}: ${trendMatch.keyword}`}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'linear-gradient(90deg, rgba(242,91,41,0.95), rgba(242,91,41,0.85))',
                      padding: '5px 10px 5px 8px',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(242,91,41,0.35)',
                    }}
                  >
                    <span style={{ fontSize: '12px', lineHeight: 1 }}>🔥</span>
                    <span>Trending #{trendMatch.rank}</span>
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: '#d0d0d0',
                    fontWeight: 400,
                  }}
                >
                  {item.caption}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#f25b29',
                  }}
                >
                  Rs.{(Number(item.totalBudget) / 1000).toFixed(0)}k
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '4px',
                }}
              >
                {item.style} &middot; {item.timeEstimate}
              </div>
            </div>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
            Loading styles...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#666', fontFamily: 'var(--font-sans)', fontSize: '15px', marginBottom: '1rem' }}>
              No styles found{searchQuery ? ` for &ldquo;${searchQuery}&rdquo;` : ''}
            </p>
            <button
              onClick={() => { setActiveWeek('ALL'); setSearchQuery(''); }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '10px 24px',
                borderRadius: '4px',
                border: '1px solid rgba(242,91,41,0.4)',
                background: 'transparent',
                color: '#f25b29',
                cursor: 'pointer',
              }}
            >
              Show All Styles
            </button>
          </div>
        )}
      </section>

      {/* Style Detail Modal */}
      {selectedItem && (
        <StyleDetailModal
          detail={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
