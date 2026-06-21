/**
 * AI Image Generation Service
 * ===========================
 * 
 * This service handles room redesign by calling external AI image APIs.
 * 
 * HOW IT WORKS:
 * 1. User uploads a room photo
 * 2. We construct a prompt based on room type + design style
 * 3. Call AI API (DALL-E 3, Stability AI, etc.)
 * 4. Return the generated image URL
 * 
 * TO ACTIVATE:
 * 1. Choose a provider below
 * 2. Get API key from the provider
 * 3. Add key to .env file
 * 4. Set AI_PROVIDER in .env
 * 5. Restart the server
 */

// Provider selection from env
const PROVIDER = process.env.AI_PROVIDER || 'mock'; // 'mock' | 'openai' | 'stability' | 'replicate' | 'leonardo'

// Cost tracking (per image generated)
let generationCount = 0;
export function getGenerationStats() {
  return { count: generationCount, provider: PROVIDER };
}

// ============================================================
// MOCK MODE (default - no API key needed)
// Returns pre-generated images. Use this for demo/testing.
// ============================================================
const mockImages: Record<string, string> = {
  modern: '/images/rooms/room1-back.jpg',
  scandinavian: '/images/rooms/room2-back.jpg',
  japandi: '/images/rooms/room3-back.jpg',
  luxury: '/images/rooms/room4-back.jpg',
  boho: '/images/gallery/item1.jpg',
  industrial: '/images/gallery/item2.jpg',
  'traditional-indian': '/images/gallery/item3.jpg',
  'smart-home': '/images/gallery/item4.jpg',
  mediterranean: '/images/gallery/mediterranean.jpg',
  farmhouse: '/images/gallery/farmhouse.jpg',
  coastal: '/images/gallery/coastal.jpg',
  'mid-century': '/images/gallery/midcentury.jpg',
};

async function mockGenerate(_prompt: string, style: string): Promise<string> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
  return mockImages[style] || mockImages.modern;
}

// ============================================================
// OPENAI DALL-E 3 (Recommended)
// Cost: ~$0.04-0.08 per image
// Quality: Best for interiors
// Sign up: https://platform.openai.com/
// ============================================================
async function openaiGenerate(prompt: string, _style: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set in .env');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'hd',
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: { message?: string } };
    throw new Error(`OpenAI error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json() as { data: Array<{ url: string }> };
  return data.data[0].url;
}

// ============================================================
// STABILITY AI (Budget-friendly)
// Cost: ~$0.01-0.02 per image
// Quality: Good, very fast
// Sign up: https://platform.stability.ai/
// ============================================================
async function stabilityGenerate(prompt: string, _style: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) throw new Error('STABILITY_API_KEY not set in .env');

  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        steps: 30,
        width: 1024,
        height: 1024,
        samples: 1,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Stability AI error: ${response.statusText}`);
  }

  const data = await response.json() as { artifacts: Array<{ base64: string }> };
  const base64 = data.artifacts[0].base64;
  return `data:image/png;base64,${base64}`;
}

// ============================================================
// REPLICATE (Flexible - any model)
// Cost: ~$0.01-0.05 per image
// Sign up: https://replicate.com/
// ============================================================
async function replicateGenerate(prompt: string, _style: string): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) throw new Error('REPLICATE_API_TOKEN not set in .env');

  // Using SDXL model - great for interiors
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiToken}`,
      Prefer: 'wait', // Wait for result (synchronous)
    },
    body: JSON.stringify({
      version: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate error: ${response.statusText}`);
  }

  const data = await response.json() as { output: string[] };
  return data.output[0];
}

// ============================================================
// LEONARDO AI (Free tier available)
// Cost: Free 150 tokens/day, then ~$0.01/image
// Sign up: https://leonardo.ai/
// ============================================================
async function leonardoGenerate(prompt: string, _style: string): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY;
  if (!apiKey) throw new Error('LEONARDO_API_KEY not set in .env');

  // Step 1: Create generation
  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f34d3', // Leonardo Diffusion XL
      width: 1024,
      height: 1024,
      num_images: 1,
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Leonardo error: ${createResponse.statusText}`);
  }

  const createData = await createResponse.json() as {
    sdGenerationJob: { generationId: string };
  };
  const generationId = createData.sdGenerationJob.generationId;

  // Step 2: Poll for result
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const getResponse = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const getData = await getResponse.json() as {
      generations_by_pk?: { generated_images?: Array<{ url: string }> };
    };
    if (getData.generations_by_pk?.generated_images?.[0]?.url) {
      return getData.generations_by_pk.generated_images[0].url;
    }
  }

  throw new Error('Leonardo generation timed out');
}

// ============================================================
// PROMPT BUILDER
// ============================================================

const roomTypeNames: Record<string, string> = {
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

const styleDescriptions: Record<string, string> = {
  modern: 'modern minimalist style with clean lines, neutral colors, sleek furniture, and minimal decor',
  scandinavian: 'Scandinavian style with light oak wood furniture, white walls, soft textiles, cozy lighting, and indoor plants',
  japandi: 'Japandi style blending Japanese zen aesthetics with Scandinavian warmth, natural materials, tatami elements, and minimal decor',
  luxury: 'luxury style with opulent velvet furniture, crystal chandelier, marble accents, gold details, and rich textures',
  boho: 'bohemian style with rattan furniture, macrame wall hangings, colorful patterned rugs, floor cushions, and abundant plants',
  industrial: 'industrial loft style with exposed brick, steel beams, leather sofa, Edison bulb lighting, and reclaimed wood furniture',
  'traditional-indian': 'traditional Indian style with carved wooden furniture, brass accents, vibrant textiles, decorative mirrors, and patterned rugs',
  'smart-home': 'smart modern home with integrated technology, sleek white furniture, hidden LED lighting, automated systems, and minimalist design',
  mediterranean: 'Mediterranean style with whitewashed walls, terracotta tiles, wrought iron furniture, blue and white accents, and climbing plants',
  farmhouse: 'farmhouse style with white shiplap walls, apron front sink, butcher block countertops, open shelving, and mason jar lighting',
  coastal: 'coastal beach house style with white and navy palette, whitewashed floors, linen furniture, driftwood decor, and natural textures',
  'mid-century': 'mid-century modern style with teak wood furniture, bold accent colors, geometric patterns, tapered legs, and arc lamps',
  'art-deco': 'Art Deco style with geometric patterns, gold and black palette, velvet upholstery, sunburst mirrors, and crystal chandeliers',
  moroccan: 'Moroccan style with intricate tile work, colorful poufs, brass lanterns, carved screens, and rich jewel tones',
  zen: 'zen minimalist style with tatami mats, shoji screens, paper lanterns, natural stone water features, and single ikebana arrangements',
  rustic: 'rustic mountain cabin style with log walls, stone fireplace, fur throws, plaid bedding, antler chandelier, and warm amber lighting',
  contemporary: 'contemporary luxury style with marble floors, designer furniture, glass tables, abstract art, and gold accents',
  tropical: 'tropical resort style with white canopy bed, bamboo furniture, palm leaf prints, ceiling fans, and lush indoor plants',
  korean: 'Korean minimalist style with low platform bed, paper lantern, sliding doors, tea corner, and natural materials',
};

export function buildPrompt(roomType: string, designStyle: string): string {
  const roomName = roomTypeNames[roomType] || roomType;
  const styleDesc = styleDescriptions[designStyle] || designStyle;

  return `Interior design of a beautiful ${roomName} in ${styleDesc}. Professional architectural photography, highly detailed, photorealistic, warm lighting, 4K quality.`;
}

// ============================================================
// MAIN GENERATE FUNCTION
// ============================================================

export async function generateRoomMakeover(
  roomType: string,
  designStyle: string
): Promise<{ imageUrl: string; provider: string; cost: string }> {
  const prompt = buildPrompt(roomType, designStyle);

  let imageUrl: string;
  let cost: string;

  switch (PROVIDER) {
    case 'openai':
      imageUrl = await openaiGenerate(prompt, designStyle);
      cost = '$0.04-0.08';
      break;
    case 'stability':
      imageUrl = await stabilityGenerate(prompt, designStyle);
      cost = '$0.01-0.02';
      break;
    case 'replicate':
      imageUrl = await replicateGenerate(prompt, designStyle);
      cost = '$0.01-0.05';
      break;
    case 'leonardo':
      imageUrl = await leonardoGenerate(prompt, designStyle);
      cost = 'Free-150/day';
      break;
    case 'mock':
    default:
      imageUrl = await mockGenerate(prompt, designStyle);
      cost = '$0 (demo)';
      break;
  }

  generationCount++;
  return { imageUrl, provider: PROVIDER, cost };
}

// ============================================================
// COLOR PALETTE EXTRACTION
// Uses a simple algorithm + predefined palettes per style
// ============================================================

const stylePalettes: Record<string, { name: string; hex: string }[]> = {
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
  mediterranean: [
    { name: 'Santorini White', hex: '#F5F5F0' },
    { name: 'Cobalt Blue', hex: '#0047AB' },
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Olive Green', hex: '#808000' },
    { name: 'Wrought Iron', hex: '#2C2C2C' },
  ],
  farmhouse: [
    { name: 'Farmhouse White', hex: '#F5F5F0' },
    { name: 'Natural Wood', hex: '#C4A484' },
    { name: 'Sage Green', hex: '#A8BFA3' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Cream', hex: '#FFFFF0' },
  ],
  coastal: [
    { name: 'Coastal White', hex: '#F5F5F0' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Sand', hex: '#C2B280' },
    { name: 'Seafoam', hex: '#93E9BE' },
    { name: 'Driftwood', hex: '#A89F91' },
  ],
  'mid-century': [
    { name: 'Mustard', hex: '#D4A017' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Walnut', hex: '#6B4F3A' },
    { name: 'Burnt Orange', hex: '#CC5500' },
    { name: 'Olive', hex: '#808000' },
  ],
};

export function getColorPalette(designStyle: string): { name: string; hex: string }[] {
  return stylePalettes[designStyle] || stylePalettes.modern;
}

// ============================================================
// FURNITURE RECOMMENDATIONS
// Returns product recommendations per room type
// ============================================================

const al = (kw: string) => `https://www.amazon.in/s?k=${encodeURIComponent(kw)}&tag=5010b3-21`;

const furnitureDB: Record<string, { name: string; price: number; link: string; category: string }[]> = {
  bedroom: [
    { name: 'Wooden Queen Bed Frame', price: 18000, link: al('wooden queen bed frame sheesham'), category: 'Furniture' },
    { name: 'Bedside Table Set', price: 4500, link: al('bedside table set of 2 wooden'), category: 'Furniture' },
    { name: 'Table Lamp', price: 2500, link: al('bedroom table lamp ceramic warm'), category: 'Lighting' },
    { name: 'Area Rug', price: 3200, link: al('bedroom area rug 5x7 soft shag'), category: 'Rug' },
    { name: 'Wall Art Set', price: 1800, link: al('wall art set of 3 canvas bedroom'), category: 'Decor' },
  ],
  'living-room': [
    { name: '3-Seater Fabric Sofa', price: 25000, link: al('3 seater fabric sofa grey modern'), category: 'Furniture' },
    { name: 'Coffee Table', price: 8000, link: al('coffee table wooden round living room'), category: 'Furniture' },
    { name: 'Floor Lamp', price: 4500, link: al('floor lamp modern arc LED'), category: 'Lighting' },
    { name: 'TV Unit', price: 15000, link: al('TV unit cabinet entertainment wooden'), category: 'Furniture' },
    { name: 'Cushion Set', price: 2000, link: al('decorative cushion covers set of 5'), category: 'Textiles' },
  ],
  kitchen: [
    { name: 'Kitchen Island', price: 30000, link: al('kitchen island portable marble top'), category: 'Furniture' },
    { name: 'Bar Stool Set', price: 8000, link: al('bar stools set of 2 counter height'), category: 'Seating' },
    { name: 'Pendant Lights', price: 5000, link: al('pendant lights kitchen island glass'), category: 'Lighting' },
    { name: 'Open Shelf Unit', price: 6000, link: al('open shelf unit kitchen industrial'), category: 'Storage' },
    { name: 'Ceramic Dinner Set', price: 3500, link: al('ceramic dinner set 24 pieces white'), category: 'Tableware' },
  ],
  bathroom: [
    { name: 'Vanity Cabinet', price: 12000, link: al('bathroom vanity cabinet mirror sink'), category: 'Furniture' },
    { name: 'LED Mirror', price: 8000, link: al('LED bathroom mirror backlit touch'), category: 'Lighting' },
    { name: 'Towel Rack Set', price: 2500, link: al('towel rack set stainless steel wall'), category: 'Hardware' },
    { name: 'Shower Curtain', price: 1500, link: al('shower curtain waterproof modern'), category: 'Textiles' },
    { name: 'Bath Mat Set', price: 1800, link: al('bath mat set 2 piece memory foam'), category: 'Textiles' },
  ],
  'home-office': [
    { name: 'Ergonomic Office Chair', price: 15000, link: al('ergonomic office chair mesh lumbar'), category: 'Furniture' },
    { name: 'Standing Desk', price: 20000, link: al('electric standing desk height adjustable'), category: 'Furniture' },
    { name: 'Desk Lamp', price: 3000, link: al('desk lamp LED dimmable wireless charge'), category: 'Lighting' },
    { name: 'Bookshelf', price: 10000, link: al('bookshelf wooden 5 tier tall'), category: 'Storage' },
    { name: 'Cable Organizer', price: 800, link: al('cable organizer box desk management'), category: 'Accessories' },
  ],
  'dining-room': [
    { name: '6-Seater Dining Table', price: 35000, link: al('6 seater dining table wooden sheesham'), category: 'Furniture' },
    { name: 'Dining Chair Set', price: 18000, link: al('dining chairs set of 6 upholstered'), category: 'Seating' },
    { name: 'Chandelier', price: 12000, link: al('chandelier modern dining room gold'), category: 'Lighting' },
    { name: 'Sideboard Cabinet', price: 25000, link: al('sideboard cabinet buffet wooden storage'), category: 'Furniture' },
    { name: 'Table Runner Set', price: 1500, link: al('table runner set dining linen'), category: 'Textiles' },
  ],
};

export function getFurnitureRecommendations(roomType: string) {
  return furnitureDB[roomType] || furnitureDB['living-room'];
}

export function getTotalBudget(roomType: string): number {
  const items = getFurnitureRecommendations(roomType);
  return items.reduce((sum, item) => sum + item.price, 0);
}
