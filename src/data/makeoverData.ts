import type { RoomType, DesignStyle, FurnitureItem, ColorSwatch, DetectedItem } from '../types/makeover';

export const roomTypes: { value: RoomType; label: string; icon: string }[] = [
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'living-room', label: 'Living Room', icon: '🛋️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'home-office', label: 'Home Office', icon: '💻' },
  { value: 'dining-room', label: 'Dining Room', icon: '🍽️' },
  { value: 'entryway', label: 'Entryway', icon: '🚪' },
  { value: 'balcony', label: 'Balcony', icon: '🪴' },
  { value: 'kids-room', label: "Kid's Room", icon: '🧸' },
  { value: 'pooja-room', label: 'Pooja Room', icon: '🙏' },
  { value: 'wardrobe', label: 'Wardrobe', icon: '👗' },
  { value: 'guest-room', label: 'Guest Room', icon: '🏠' },
];

export const designStyles: { value: DesignStyle; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern Minimalist', description: 'Clean lines, neutral tones, functional beauty' },
  { value: 'scandinavian', label: 'Scandinavian', description: 'Light woods, cozy textures, natural light' },
  { value: 'japandi', label: 'Japandi', description: 'Japanese simplicity meets Scandinavian warmth' },
  { value: 'luxury', label: 'Luxury', description: 'Opulent materials, rich textures, statement pieces' },
  { value: 'boho', label: 'Boho', description: 'Eclectic patterns, natural materials, vibrant colors' },
  { value: 'industrial', label: 'Industrial', description: 'Raw materials, exposed elements, urban edge' },
  { value: 'traditional-indian', label: 'Traditional Indian', description: 'Carved wood, brass accents, rich textiles' },
  { value: 'smart-home', label: 'Smart Home', description: 'Integrated tech, sleek automation, futuristic' },
];

export const budgetLabels: Record<string, string> = {
  'under-10k': 'Under Rs.10,000',
  '10k-25k': 'Rs.10,000 - Rs.25,000',
  '25k-50k': 'Rs.25,000 - Rs.50,000',
  '50k-100k': 'Rs.50,000 - Rs.1,00,000',
  'above-100k': 'Above Rs.1,00,000',
};

export const colorPalettes: Record<DesignStyle, ColorSwatch[]> = {
  modern: [
    { name: 'Pure White', hex: '#FFFFFF' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Warm Grey', hex: '#B0B0B0' },
    { name: 'Natural Oak', hex: '#C4A484' },
    { name: 'Soft Black', hex: '#1A1A1A' },
  ],
  scandinavian: [
    { name: 'Warm White', hex: '#F5F2EA' },
    { name: 'Sage Green', hex: '#A8BFA3' },
    { name: 'Walnut Brown', hex: '#6B4F3A' },
    { name: 'Dusty Blue', hex: '#8FA3B5' },
    { name: 'Beige', hex: '#E8DCC8' },
  ],
  japandi: [
    { name: 'Rice Paper', hex: '#F0EDE5' },
    { name: 'Stone Grey', hex: '#8C8C8C' },
    { name: 'Bamboo', hex: '#C8A951' },
    { name: 'Charcoal Ink', hex: '#2C2C2C' },
    { name: 'Moss Green', hex: '#7A8B6F' },
  ],
  luxury: [
    { name: 'Cream Gold', hex: '#F5E6CC' },
    { name: 'Emerald', hex: '#2D5A3D' },
    { name: 'Royal Navy', hex: '#1B2A4A' },
    { name: 'Brass', hex: '#B5A642' },
    { name: 'Deep Burgundy', hex: '#800020' },
  ],
  boho: [
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Mustard', hex: '#D4A017' },
    { name: 'Olive', hex: '#808000' },
    { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Rust', hex: '#B7410E' },
  ],
  industrial: [
    { name: 'Concrete Grey', hex: '#989898' },
    { name: 'Brick Red', hex: '#A0522D' },
    { name: 'Steel Blue', hex: '#4682B4' },
    { name: 'Raw Wood', hex: '#8B6914' },
    { name: 'Matte Black', hex: '#2B2B2B' },
  ],
  'traditional-indian': [
    { name: 'Marigold', hex: '#F4A460' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Deep Red', hex: '#C41E3A' },
    { name: 'Ivory', hex: '#FFFFF0' },
    { name: 'Saffron', hex: '#F4C430' },
  ],
  'smart-home': [
    { name: 'Pure White', hex: '#FAFAFA' },
    { name: 'Arctic Blue', hex: '#E0F2F7' },
    { name: 'Graphite', hex: '#474747' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Neon Accent', hex: '#39FF14' },
  ],
};

const al = (keyword: string) => `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=5010b3-21`;

export const furnitureRecommendations: Record<RoomType, Record<string, FurnitureItem[]>> = {
  bedroom: {
    default: [
      { name: 'Wooden Queen Bed Frame', price: 18000, affiliateLink: al('wooden queen bed frame sheesham') },
      { name: 'Bedside Table Set', price: 4500, affiliateLink: al('bedside table set of 2 wooden') },
      { name: 'Table Lamp', price: 2500, affiliateLink: al('bedroom table lamp ceramic warm') },
      { name: 'Area Rug', price: 3200, affiliateLink: al('bedroom area rug 5x7 soft shag') },
      { name: 'Wall Art Set', price: 1800, affiliateLink: al('wall art set of 3 canvas bedroom') },
    ],
  },
  'living-room': {
    default: [
      { name: '3-Seater Fabric Sofa', price: 25000, affiliateLink: al('3 seater fabric sofa grey modern') },
      { name: 'Coffee Table', price: 8000, affiliateLink: al('coffee table wooden round living room') },
      { name: 'Floor Lamp', price: 4500, affiliateLink: al('floor lamp modern arc LED') },
      { name: 'TV Unit', price: 15000, affiliateLink: al('TV unit cabinet entertainment wooden') },
      { name: 'Cushion Set', price: 2000, affiliateLink: al('decorative cushion covers set of 5') },
    ],
  },
  kitchen: {
    default: [
      { name: 'Kitchen Island', price: 30000, affiliateLink: al('kitchen island portable marble top') },
      { name: 'Bar Stool Set', price: 8000, affiliateLink: al('bar stools set of 2 counter height') },
      { name: 'Pendant Lights', price: 5000, affiliateLink: al('pendant lights kitchen island glass') },
      { name: 'Open Shelf Unit', price: 6000, affiliateLink: al('open shelf unit kitchen industrial') },
      { name: 'Ceramic Dinner Set', price: 3500, affiliateLink: al('ceramic dinner set 24 pieces white') },
    ],
  },
  bathroom: {
    default: [
      { name: 'Vanity Cabinet', price: 12000, affiliateLink: al('bathroom vanity cabinet mirror sink') },
      { name: 'LED Mirror', price: 8000, affiliateLink: al('LED bathroom mirror backlit touch') },
      { name: 'Towel Rack Set', price: 2500, affiliateLink: al('towel rack set stainless steel wall') },
      { name: 'Shower Curtain', price: 1500, affiliateLink: al('shower curtain waterproof modern') },
      { name: 'Bath Mat Set', price: 1800, affiliateLink: al('bath mat set 2 piece memory foam') },
    ],
  },
  'home-office': {
    default: [
      { name: 'Ergonomic Office Chair', price: 15000, affiliateLink: al('ergonomic office chair mesh lumbar') },
      { name: 'Standing Desk', price: 20000, affiliateLink: al('electric standing desk height adjustable') },
      { name: 'Desk Lamp', price: 3000, affiliateLink: al('desk lamp LED dimmable wireless charge') },
      { name: 'Bookshelf', price: 10000, affiliateLink: al('bookshelf wooden 5 tier tall') },
      { name: 'Cable Organizer', price: 800, affiliateLink: al('cable organizer box desk management') },
    ],
  },
  'dining-room': {
    default: [
      { name: '6-Seater Dining Table', price: 35000, affiliateLink: al('6 seater dining table wooden sheesham') },
      { name: 'Dining Chair Set', price: 18000, affiliateLink: al('dining chairs set of 6 upholstered') },
      { name: 'Chandelier', price: 12000, affiliateLink: al('chandelier modern dining room gold') },
      { name: 'Sideboard Cabinet', price: 25000, affiliateLink: al('sideboard cabinet buffet wooden storage') },
      { name: 'Table Runner Set', price: 1500, affiliateLink: al('table runner set dining linen') },
    ],
  },
  entryway: {
    default: [
      { name: 'Console Table', price: 8500, affiliateLink: al('console table entryway wooden') },
      { name: 'Shoe Rack Cabinet', price: 4500, affiliateLink: al('shoe rack cabinet closed entryway') },
      { name: 'Round Wall Mirror', price: 3200, affiliateLink: al('round wall mirror entryway decorative') },
      { name: 'Key Holder & Mail Organizer', price: 800, affiliateLink: al('key holder wall mounted mail organizer') },
      { name: 'Indoor Plant Stand', price: 1200, affiliateLink: al('plant stand indoor tall metal') },
    ],
  },
  balcony: {
    default: [
      { name: 'Outdoor Bistro Set', price: 6500, affiliateLink: al('balcony bistro set 2 seater folding') },
      { name: 'Vertical Garden Planter', price: 1800, affiliateLink: al('vertical garden planter wall mounted') },
      { name: 'Outdoor String Lights', price: 1200, affiliateLink: al('outdoor string lights waterproof balcony') },
      { name: 'Artificial Grass Mat', price: 2500, affiliateLink: al('artificial grass mat balcony floor') },
      { name: 'Folding Outdoor Chair', price: 2200, affiliateLink: al('folding outdoor chair balcony portable') },
    ],
  },
  'kids-room': {
    default: [
      { name: 'Bunk Bed with Storage', price: 28000, affiliateLink: al('bunk bed with storage drawers kids') },
      { name: 'Study Desk with Hutch', price: 8000, affiliateLink: al('kids study desk with hutch white') },
      { name: 'Toy Storage Organizer', price: 3500, affiliateLink: al('toy storage organizer shelf bins') },
      { name: 'Colorful Area Rug', price: 2500, affiliateLink: al('colorful kids area rug non slip') },
      { name: 'Wall Decals Set', price: 800, affiliateLink: al('wall decals kids room jungle animals') },
    ],
  },
  'pooja-room': {
    default: [
      { name: 'Wooden Pooja Mandir', price: 15000, affiliateLink: al('wooden pooja mandir home temple') },
      { name: 'Brass Diya Set', price: 1200, affiliateLink: al('brass diya set pooja decorative') },
      { name: 'Incense Holder Stand', price: 600, affiliateLink: al('incense holder stand brass lotus') },
      { name: 'LED Spotlight for Mandir', price: 800, affiliateLink: al('LED spotlight cabinet mandir warm white') },
      { name: 'Marble Pooja Thali Set', price: 1500, affiliateLink: al('marble pooja thali set decorative') },
    ],
  },
  wardrobe: {
    default: [
      { name: '3-Door Wardrobe with Mirror', price: 22000, affiliateLink: al('3 door wardrobe with mirror wooden') },
      { name: 'Closet Organizer System', price: 4500, affiliateLink: al('closet organizer system shelf hanger') },
      { name: 'Storage Boxes (Set of 6)', price: 1200, affiliateLink: al('storage boxes fabric closet set of 6') },
      { name: 'Tie & Belt Rack', price: 800, affiliateLink: al('tie belt rack closet organizer') },
      { name: 'LED Strip for Closet', price: 600, affiliateLink: al('LED strip light closet motion sensor') },
    ],
  },
  'guest-room': {
    default: [
      { name: 'Sofa Cum Bed', price: 18000, affiliateLink: al('sofa cum bed queen size wooden') },
      { name: 'Bedside Table', price: 3500, affiliateLink: al('bedside table compact guest room') },
      { name: 'Table Lamp with USB', price: 1500, affiliateLink: al('table lamp USB port guest bedroom') },
      { name: 'Wall Hooks Set', price: 600, affiliateLink: al('wall hooks decorative brass set') },
      { name: 'Welcome Tray Set', price: 800, affiliateLink: al('welcome tray set guest room ceramic') },
    ],
  },
};

export function getAIStylePrompt(roomType: RoomType, style: DesignStyle): string {
  const roomNames: Record<RoomType, string> = {
    bedroom: 'bedroom',
    'living-room': 'living room',
    kitchen: 'kitchen',
    bathroom: 'bathroom',
    'home-office': 'home office',
    'dining-room': 'dining room',
    entryway: 'entryway foyer',
    balcony: 'balcony patio',
    'kids-room': "kids' bedroom",
    'pooja-room': 'prayer room',
    wardrobe: 'walk-in closet',
    'guest-room': 'guest bedroom',
  };

  const stylePrompts: Record<DesignStyle, string> = {
    modern: 'modern minimalist style with clean lines, neutral colors, sleek furniture, and minimal decor',
    scandinavian: 'Scandinavian style with light oak wood furniture, white walls, soft textiles, cozy lighting, and indoor plants',
    japandi: 'Japandi style blending Japanese zen aesthetics with Scandinavian warmth, natural materials, tatami elements, and minimal decor',
    luxury: 'luxury style with opulent velvet furniture, crystal chandelier, marble accents, gold details, and rich textures',
    boho: 'bohemian style with rattan furniture, macrame wall hangings, colorful patterned rugs, floor cushions, and abundant plants',
    industrial: 'industrial loft style with exposed brick, steel beams, leather sofa, Edison bulb lighting, and reclaimed wood furniture',
    'traditional-indian': 'traditional Indian style with carved wooden furniture, brass accents, vibrant textiles, decorative mirrors, and patterned rugs',
    'smart-home': 'smart modern home with integrated technology, sleek white furniture, hidden LED lighting, automated systems, and minimalist design',
  };

  return `Interior design of a beautiful ${roomNames[roomType]} in ${stylePrompts[style]}. Professional architectural photography, highly detailed, photorealistic, warm lighting.`;
}

export function getDetectedItems(roomType: RoomType): DetectedItem[] {
  const items = furnitureRecommendations[roomType]?.default || [];
  return items.map((item) => ({
    name: item.name.split(' ').slice(-2).join(' '),
    matchedProduct: item,
  }));
}
