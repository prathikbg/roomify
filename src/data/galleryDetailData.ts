import { amazonLink } from '../utils/affiliateLinks';

export interface GalleryProduct {
  name: string;
  price: number;
  link: string;
  category: string;
}

export interface GalleryChange {
  title: string;
  description: string;
}

export interface GalleryColor {
  name: string;
  hex: string;
}

export interface GalleryDetail {
  caption: string;
  description: string;
  image: string;
  products: GalleryProduct[];
  changes: GalleryChange[];
  colors: GalleryColor[];
  totalBudget: number;
  timeEstimate: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export const galleryDetails: Record<string, GalleryDetail> = {
  'Boho Living Room': {
    caption: 'Boho Living Room',
    description: 'A warm, eclectic boho living space featuring rattan furniture, macrame wall hangings, colorful patterned rugs, and abundant indoor plants.',
    image: 'images/gallery/item1.jpg',
    products: [
      { name: 'Rattan 3-Seater Sofa', price: 22000, link: amazonLink('rattan sofa 3 seater'), category: 'Furniture' },
      { name: 'Macrame Wall Hanging Set', price: 1800, link: amazonLink('macrame wall hanging set boho'), category: 'Decor' },
      { name: 'Persian Pattern Area Rug', price: 4500, link: amazonLink('persian area rug 5x7'), category: 'Rug' },
      { name: 'Woven Pouf Ottomans (Set of 2)', price: 3200, link: amazonLink('woven pouf ottoman set'), category: 'Seating' },
      { name: 'Hanging Planter Set', price: 1200, link: amazonLink('hanging planters indoor set'), category: 'Plants' },
      { name: 'Vintage Floor Cushions', price: 2500, link: amazonLink('floor cushions boho vintage'), category: 'Seating' },
      { name: 'Brass Table Lamp', price: 2800, link: amazonLink('brass table lamp antique'), category: 'Lighting' },
      { name: 'Handwoven Throw Blankets', price: 1500, link: amazonLink('handwoven throw blanket cotton'), category: 'Textiles' },
    ],
    changes: [
      { title: 'Layer Textiles', description: 'Add 3-5 patterned rugs overlapping on the floor. Mix Persian, Moroccan, and kilim styles for authentic boho vibes.' },
      { title: 'Add Macrame & Wall Decor', description: 'Hang 2-3 macrame pieces on the main wall. Mix with woven baskets and vintage mirrors for dimension.' },
      { title: 'Bring in Plants', description: 'Place 5-7 indoor plants of varying sizes. Use hanging planters near windows and floor pots in corners.' },
      { title: 'Swap for Natural Furniture', description: 'Replace metal/plastic furniture with rattan, bamboo, or reclaimed wood pieces. Look for curved lines.' },
      { title: 'Add Floor Cushions', description: 'Scatter 4-6 floor cushions and poufs around the coffee table area for casual low seating.' },
      { title: 'Warm Lighting', description: 'Switch to warm Edison bulbs and add brass/copper table lamps. Avoid cool white LED lighting.' },
    ],
    colors: [
      { name: 'Terracotta', hex: '#E2725B' },
      { name: 'Mustard', hex: '#D4A017' },
      { name: 'Olive', hex: '#808000' },
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Rust', hex: '#B7410E' },
    ],
    totalBudget: 39500,
    timeEstimate: '2-3 weekends',
    difficulty: 'Medium',
  },
  'Industrial Loft': {
    caption: 'Industrial Loft',
    description: 'Raw and refined industrial loft design with exposed brick walls, steel beam ceilings, large factory windows, and vintage Edison bulb lighting.',
    image: 'images/gallery/item2.jpg',
    products: [
      { name: 'Leather Chesterfield Sofa', price: 35000, link: amazonLink('leather chesterfield sofa 3 seater'), category: 'Furniture' },
      { name: 'Reclaimed Wood Coffee Table', price: 8500, link: amazonLink('reclaimed wood coffee table industrial'), category: 'Furniture' },
      { name: 'Edison Bulb Pendant Light', price: 3800, link: amazonLink('edison bulb pendant light vintage'), category: 'Lighting' },
      { name: 'Metal Bar Stools (Set of 2)', price: 6000, link: amazonLink('metal bar stools industrial set of 2'), category: 'Seating' },
      { name: 'Vintage Factory Clock', price: 2200, link: amazonLink('vintage factory wall clock industrial'), category: 'Decor' },
      { name: 'Iron Pipe Bookshelf', price: 7500, link: amazonLink('iron pipe bookshelf industrial vintage'), category: 'Storage' },
      { name: 'Concrete Planters (Set)', price: 1800, link: amazonLink('concrete planters set modern'), category: 'Plants' },
      { name: 'Distressed Area Rug', price: 4200, link: amazonLink('distressed area rug vintage industrial'), category: 'Rug' },
    ],
    changes: [
      { title: 'Expose Raw Materials', description: 'Remove plaster to expose brick walls. If not possible, use brick wallpaper or textured paint for similar effect.' },
      { title: 'Install Edison Lighting', description: 'Replace ceiling fixtures with exposed Edison bulb pendants. Use black iron pipe or rope as cord covers.' },
      { title: 'Add Metal Accents', description: 'Introduce wrought iron, steel, and copper elements through furniture legs, shelving brackets, and light fixtures.' },
      { title: 'Choose Leather & Wood', description: 'Opt for distressed leather sofas and reclaimed wood tables. The patina adds character to the industrial look.' },
      { title: 'Use a Neutral Palette', description: 'Stick to greys, blacks, browns, and cream. Add color sparingly through greenery or a single accent piece.' },
      { title: 'Open the Space', description: 'Minimize partitions. Use open shelving instead of closed cabinets. Keep sightlines clear across the room.' },
    ],
    colors: [
      { name: 'Concrete Grey', hex: '#989898' },
      { name: 'Brick Red', hex: '#A0522D' },
      { name: 'Steel Blue', hex: '#4682B4' },
      { name: 'Raw Wood', hex: '#8B6914' },
      { name: 'Matte Black', hex: '#2B2B2B' },
    ],
    totalBudget: 69000,
    timeEstimate: '3-4 weekends',
    difficulty: 'Advanced',
  },
  'Traditional Indian': {
    caption: 'Traditional Indian',
    description: 'A vibrant Indian apartment living room featuring carved wooden furniture, brass accents, colorful textiles, and decorative mirrors.',
    image: 'images/gallery/item3.jpg',
    products: [
      { name: 'Carved Sheesham Wood Sofa', price: 28000, link: amazonLink('carved sheesham wood sofa set'), category: 'Furniture' },
      { name: 'Brass Urli Bowl', price: 1500, link: amazonLink('brass urli bowl decorative'), category: 'Decor' },
      { name: 'Handwoven Dhurrie Rug', price: 3500, link: amazonLink('handwoven dhurrie rug indian'), category: 'Rug' },
      { name: 'Decorative Brass Mirror', price: 4200, link: amazonLink('decorative brass wall mirror round'), category: 'Decor' },
      { name: 'Silk Cushion Covers (Set of 5)', price: 2000, link: amazonLink('silk cushion covers set of 5'), category: 'Textiles' },
      { name: 'Wooden Swing Jhula', price: 18000, link: amazonLink('indoor wooden swing jhula'), category: 'Furniture' },
      { name: 'Terracotta Pot Set', price: 1200, link: amazonLink('terracotta pots decorative set'), category: 'Decor' },
      { name: 'Marble Inlay Side Table', price: 5500, link: amazonLink('marble inlay side table pietra dura'), category: 'Furniture' },
    ],
    changes: [
      { title: 'Add Carved Wood Furniture', description: 'Replace modern furniture with sheesham or teak pieces featuring traditional Indian carvings and inlay work.' },
      { title: 'Layer Indian Textiles', description: 'Use silk, brocade, and block-printed fabrics for cushions, throws, and curtains. Mix patterns confidently.' },
      { title: 'Incorporate Brass & Copper', description: 'Add brass urli bowls, copper planters, and metal artifacts as table and shelf decor.' },
      { title: 'Hang Decorative Mirrors', description: 'Install arched or round brass-framed mirrors. Group 2-3 smaller mirrors as a wall feature.' },
      { title: 'Use Warm Lighting', description: 'Switch to warm yellow lighting. Add diyas or LED tea lights for evening ambiance.' },
      { title: 'Add an Indoor Swing', description: 'If space allows, install a wooden jhula (swing) — the centerpiece of traditional Indian living rooms.' },
    ],
    colors: [
      { name: 'Marigold', hex: '#F4A460' },
      { name: 'Teal', hex: '#008080' },
      { name: 'Deep Red', hex: '#C41E3A' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Saffron', hex: '#F4C430' },
    ],
    totalBudget: 63900,
    timeEstimate: '2-3 weekends',
    difficulty: 'Medium',
  },
  'Smart Home Living': {
    caption: 'Smart Home Living',
    description: 'A futuristic smart home living room with sleek white entertainment units, hidden LED strip lighting, automated curtains, and integrated technology.',
    image: 'images/gallery/item4.jpg',
    products: [
      { name: 'Smart LED Strip Lights', price: 2500, link: amazonLink('smart LED strip lights RGB wifi'), category: 'Lighting' },
      { name: 'Motorized Curtain Rod', price: 8500, link: amazonLink('motorized curtain rod automatic'), category: 'Automation' },
      { name: 'Smart Speaker System', price: 12000, link: amazonLink('smart speaker home system echo'), category: 'Tech' },
      { name: 'White Entertainment Unit', price: 15000, link: amazonLink('white entertainment unit TV cabinet'), category: 'Furniture' },
      { name: 'Smart Plug Set (4-pack)', price: 2000, link: amazonLink('smart plug wifi 4 pack'), category: 'Automation' },
      { name: 'Touch Panel Dimmer', price: 3500, link: amazonLink('touch panel dimmer switch glass'), category: 'Lighting' },
      { name: 'Wireless Charging Side Table', price: 6000, link: amazonLink('wireless charging side table nightstand'), category: 'Furniture' },
      { name: 'Smart Thermostat', price: 8000, link: amazonLink('smart thermostat wifi programmable'), category: 'Tech' },
    ],
    changes: [
      { title: 'Install LED Strip Lighting', description: 'Add RGB LED strips behind the TV unit, under shelves, and along ceiling coves. Use app-controlled strips.' },
      { title: 'Automate Curtains', description: 'Replace manual curtain rods with motorized ones. Schedule open/close times via smartphone app.' },
      { title: 'Centralize Entertainment', description: 'Get a sleek white entertainment unit with cable management. Mount TV with hidden wiring.' },
      { title: 'Add Smart Plugs', description: 'Convert all lamps and appliances to smart control. Create scenes like "Movie Night" or "Morning".' },
      { title: 'Upgrade to Touch Controls', description: 'Replace traditional switches with glass touch panels. Add dimmer controls for mood lighting.' },
      { title: 'Minimize Visual Clutter', description: 'Use wireless charging furniture. Hide all cables in walls or cable conduits. Keep surfaces clear.' },
    ],
    colors: [
      { name: 'Pure White', hex: '#FAFAFA' },
      { name: 'Arctic Blue', hex: '#E0F2F7' },
      { name: 'Graphite', hex: '#474747' },
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Neon Accent', hex: '#39FF14' },
    ],
    totalBudget: 57500,
    timeEstimate: '1-2 weekends',
    difficulty: 'Easy',
  },
  'Small Bedroom Makeover': {
    caption: 'Small Bedroom Makeover',
    description: 'A clever small bedroom transformation using space-saving furniture, floating shelves, warm string lights, and a compact workspace corner.',
    image: 'images/gallery/item5.jpg',
    products: [
      { name: 'Storage Bed with Drawers', price: 18000, link: amazonLink('storage bed queen size with drawers'), category: 'Furniture' },
      { name: 'Floating Wall Shelves (Set)', price: 1500, link: amazonLink('floating wall shelves set of 3'), category: 'Storage' },
      { name: 'LED String Lights', price: 800, link: amazonLink('LED string lights warm white bedroom'), category: 'Lighting' },
      { name: 'Foldable Wall-Mounted Desk', price: 4500, link: amazonLink('foldable wall mounted desk study'), category: 'Furniture' },
      { name: 'Full-Length Mirror', price: 2500, link: amazonLink('full length mirror wall mounted'), category: 'Decor' },
      { name: 'Under-Bed Storage Boxes', price: 1200, link: amazonLink('under bed storage boxes with wheels'), category: 'Storage' },
      { name: 'Slim Nightstand', price: 2500, link: amazonLink('slim nightstand narrow bedside table'), category: 'Furniture' },
      { name: 'Blackout Curtains', price: 2000, link: amazonLink('blackout curtains thermal insulated'), category: 'Textiles' },
    ],
    changes: [
      { title: 'Use Multi-Functional Furniture', description: 'Get a storage bed with drawers underneath. Use a foldable wall desk that disappears when not needed.' },
      { title: 'Install Floating Shelves', description: 'Replace floor-standing bookshelves with floating wall shelves. Keep the floor clear to make the room feel bigger.' },
      { title: 'Add a Large Mirror', description: 'Place a full-length mirror on one wall. It reflects light and creates the illusion of double the space.' },
      { title: 'Hang String Lights', description: 'Drape warm LED string lights along the headboard and around the window. Creates cozy ambiance without taking space.' },
      { title: 'Choose Light Colors', description: 'Paint walls in whites, creams, or soft pastels. Dark colors make small rooms feel cramped.' },
      { title: 'Maximize Vertical Space', description: 'Use tall wardrobes and stackable storage. Go vertical when you cannot go horizontal.' },
    ],
    colors: [
      { name: 'Warm White', hex: '#F5F2EA' },
      { name: 'Soft Grey', hex: '#D3D3D3' },
      { name: 'Blush Pink', hex: '#F4C2C2' },
      { name: 'Light Wood', hex: '#DEB887' },
      { name: 'Sage Green', hex: '#9DC183' },
    ],
    totalBudget: 33000,
    timeEstimate: '1-2 weekends',
    difficulty: 'Easy',
  },
  'Modern Kitchen': {
    caption: 'Modern Kitchen',
    description: 'A stunning kitchen renovation featuring white cabinets with gold handles, marble countertops, a functional kitchen island with bar stools, and elegant pendant lighting.',
    image: 'images/gallery/item6.jpg',
    products: [
      { name: 'Kitchen Island with Marble Top', price: 35000, link: amazonLink('kitchen island marble top movable'), category: 'Furniture' },
      { name: 'Bar Stools with Gold Legs (Set of 2)', price: 8000, link: amazonLink('bar stools gold legs velvet set of 2'), category: 'Seating' },
      { name: 'Glass Pendant Lights (Set of 3)', price: 4500, link: amazonLink('glass pendant lights kitchen island set of 3'), category: 'Lighting' },
      { name: 'Open Wall Shelf Rack', price: 2500, link: amazonLink('open wall shelf rack kitchen'), category: 'Storage' },
      { name: 'Ceramic Dinner Set (24 pcs)', price: 3500, link: amazonLink('ceramic dinner set 24 pieces white'), category: 'Tableware' },
      { name: 'Gold Cabinet Handles (Set)', price: 1500, link: amazonLink('gold cabinet handles brass drawer pulls set'), category: 'Hardware' },
      { name: 'Marble Cutting Board', price: 1200, link: amazonLink('marble cutting board white cheese board'), category: 'Kitchen' },
      { name: 'Copper Cookware Set', price: 8500, link: amazonLink('copper cookware set pots pans hammered'), category: 'Kitchen' },
    ],
    changes: [
      { title: 'Upgrade Cabinet Hardware', description: 'Replace old handles with brushed gold or brass ones. Instant luxury upgrade for under ₹2,000.' },
      { title: 'Add a Kitchen Island', description: 'Install a freestanding island with storage. Use it as prep space, breakfast bar, and extra storage.' },
      { title: 'Install Pendant Lighting', description: 'Hang 2-3 glass or copper pendant lights above the island. Creates a focal point and task lighting.' },
      { title: 'Open Up Storage', description: 'Remove upper cabinet doors or replace with open shelving. Display beautiful dishes and add airiness.' },
      { title: 'Use Marble Accents', description: 'Add marble-look countertops or a marble cutting board. The veining adds sophistication.' },
      { title: 'Coordinate Metals', description: 'Pick one metal finish (gold, brass, or copper) and use it consistently for handles, faucets, and lights.' },
    ],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Carrara Marble', hex: '#F0EFEA' },
      { name: 'Brushed Gold', hex: '#C9A961' },
      { name: 'Soft Grey', hex: '#B0B0B0' },
      { name: 'Sage Green', hex: '#A8BFA3' },
    ],
    totalBudget: 65700,
    timeEstimate: '2-3 weekends',
    difficulty: 'Medium',
  },
  'Home Office Design': {
    caption: 'Home Office Design',
    description: 'A productive and stylish home office featuring a wooden desk with an ergonomic chair, floor-to-ceiling bookshelf, large window with natural light, indoor plants, and minimalist wall art.',
    image: 'images/gallery/item7.jpg',
    products: [
      { name: 'Standing Desk (Motorized)', price: 22000, link: amazonLink('motorized standing desk electric height adjustable'), category: 'Furniture' },
      { name: 'Ergonomic Mesh Chair', price: 15000, link: amazonLink('ergonomic mesh office chair lumbar support'), category: 'Furniture' },
      { name: 'LED Desk Lamp with Wireless Charge', price: 3500, link: amazonLink('LED desk lamp wireless charger USB'), category: 'Lighting' },
      { name: 'Tall Bookshelf (5-tier)', price: 8000, link: amazonLink('tall bookshelf 5 tier wooden industrial'), category: 'Storage' },
      { name: 'Desk Organizer Set', price: 1200, link: amazonLink('desk organizer set bamboo wood'), category: 'Accessories' },
      { name: 'Noise-Cancelling Headphones', price: 8000, link: amazonLink('noise cancelling headphones over ear wireless'), category: 'Tech' },
      { name: 'Indoor Plants (Set of 3)', price: 1500, link: amazonLink('indoor plants low light set of 3'), category: 'Plants' },
      { name: 'Monitor Arm Stand', price: 3500, link: amazonLink('monitor arm stand single desk mount'), category: 'Accessories' },
    ],
    changes: [
      { title: 'Invest in Ergonomics', description: 'Get a motorized standing desk and ergonomic chair. Alternate between sitting and standing throughout the day.' },
      { title: 'Maximize Natural Light', description: 'Position the desk perpendicular to the window. Use sheer curtains to diffuse harsh direct sunlight.' },
      { title: 'Add a Bookshelf', description: 'Install a tall bookshelf for storage and visual backdrop. Mix books with decor items and plants.' },
      { title: 'Upgrade Desk Lighting', description: 'Get an LED desk lamp with adjustable color temperature. Warm for evening, cool for focused daytime work.' },
      { title: 'Cable Management', description: 'Use cable trays, cord covers, and a monitor arm to eliminate visible wires. Clean desk = clear mind.' },
      { title: 'Add Greenery', description: 'Place 2-3 low-maintenance plants (snake plant, pothos, zz plant) on the desk and shelves.' },
    ],
    colors: [
      { name: 'Warm White', hex: '#F5F2EA' },
      { name: 'Walnut Brown', hex: '#6B4F3A' },
      { name: 'Sage Green', hex: '#A8BFA3' },
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Beige', hex: '#E8DCC8' },
    ],
    totalBudget: 62700,
    timeEstimate: '1-2 weekends',
    difficulty: 'Easy',
  },
  'Teen Bedroom Ideas': {
    caption: 'Teen Bedroom Ideas',
    description: 'A trendy teen bedroom featuring neon LED signs, colorful bedding, a gaming desk setup, polaroid photo walls, and fun decorative elements.',
    image: 'images/gallery/item8.jpg',
    products: [
      { name: 'Neon LED Name Sign', price: 2500, link: amazonLink('custom neon LED sign name bedroom'), category: 'Lighting' },
      { name: 'RGB LED Strip (5m)', price: 1500, link: amazonLink('RGB LED strip lights 5m bluetooth app control'), category: 'Lighting' },
      { name: 'Gaming Desk Setup', price: 12000, link: amazonLink('gaming desk setup LED carbon fiber'), category: 'Furniture' },
      { name: 'Colorful Bedding Set', price: 3500, link: amazonLink('colorful bedding set queen teen aesthetic'), category: 'Textiles' },
      { name: 'Polaroid Photo String Lights', price: 800, link: amazonLink('polaroid photo clip string lights LED'), category: 'Decor' },
      { name: 'Bean Bag Chair', price: 3500, link: amazonLink('bean bag chair XXXL with filling'), category: 'Seating' },
      { name: 'Tapestry Wall Hanging', price: 1200, link: amazonLink('tapestry wall hanging aesthetic bohemian'), category: 'Decor' },
      { name: 'Desk Organizer with Charger', price: 2000, link: amazonLink('desk organizer wireless charger pen holder'), category: 'Accessories' },
    ],
    changes: [
      { title: 'Create a Feature Wall', description: 'Use a tapestry, removable wallpaper, or a photo collage as a statement wall behind the bed.' },
      { title: 'Add Neon & LED Accents', description: 'Install a custom neon name sign and RGB LED strips behind the desk and bed for trendy ambient lighting.' },
      { title: 'Set Up a Gaming/Study Zone', description: 'Dedicate one corner to a gaming desk with proper cable management, dual monitor setup, and ergonomic chair.' },
      { title: 'Display Photos Creatively', description: 'Use polaroid-style string lights or a wire grid to display photos, tickets, and mementos.' },
      { title: 'Mix Patterns & Colors', description: 'Let personality shine through bold bedding, patterned rugs, and colorful decor. No need to match everything.' },
      { title: 'Add Casual Seating', description: 'Include a bean bag or floor chair for friends to hang out. Teens need social spaces in their room.' },
    ],
    colors: [
      { name: 'Electric Pink', hex: '#FF10F0' },
      { name: 'Neon Blue', hex: '#00FFFF' },
      { name: 'Purple Haze', hex: '#BF40BF' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Soft Lavender', hex: '#E6E6FA' },
    ],
    totalBudget: 27000,
    timeEstimate: '1 weekend',
    difficulty: 'Easy',
  },
  'TV Wall Design': {
    caption: 'TV Wall Design',
    description: 'An elegant TV wall design featuring chevron wood paneling, ambient backlighting, floating shelves with curated decor, and a sleek media console.',
    image: 'images/gallery/item9.jpg',
    products: [
      { name: 'Chevron Wood Wall Panels', price: 8000, link: amazonLink('chevron wood wall panels 3D adhesive'), category: 'Decor' },
      { name: 'TV Backlight LED Kit', price: 1500, link: amazonLink('TV backlight LED kit USB powered'), category: 'Lighting' },
      { name: 'Floating TV Console', price: 12000, link: amazonLink('floating TV console wall mounted media unit'), category: 'Furniture' },
      { name: 'Floating Display Shelves', price: 2500, link: amazonLink('floating display shelves set of 3 wall'), category: 'Storage' },
      { name: 'Decorative Vases (Set)', price: 2000, link: amazonLink('decorative vases set of 3 ceramic modern'), category: 'Decor' },
      { name: 'Cable Management Box Set', price: 800, link: amazonLink('cable management box set bamboo organizer'), category: 'Accessories' },
      { name: 'Tabletop Plant (Artificial)', price: 800, link: amazonLink('artificial plant tabletop realistic monstera'), category: 'Decor' },
      { name: 'Ambient Wall Sconces (Pair)', price: 3500, link: amazonLink('ambient wall sconces pair modern gold'), category: 'Lighting' },
    ],
    changes: [
      { title: 'Add Wood Paneling', description: 'Install chevron, slat, or geometric wood panels behind the TV. Creates instant texture and warmth.' },
      { title: 'Install TV Backlight', description: 'Add an LED backlight kit behind the TV. Reduces eye strain and creates a cinema-like experience.' },
      { title: 'Mount a Floating Console', description: 'Replace the floor TV unit with a wall-mounted floating console. Makes the room feel more spacious.' },
      { title: 'Add Floating Shelves', description: 'Install 2-3 asymmetrical floating shelves on one side. Display curated objects, books, and small plants.' },
      { title: 'Hide All Cables', description: 'Use in-wall cable routing or cable management boxes. Zero visible wires is the goal.' },
      { title: 'Balance with Lighting', description: 'Add wall sconces or picture lights on either side of the TV wall for balanced ambient lighting.' },
    ],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Warm Oak', hex: '#C4A484' },
      { name: 'Soft White', hex: '#F5F5F0' },
      { name: 'Matte Black', hex: '#2B2B2B' },
      { name: 'Brass', hex: '#B5A642' },
    ],
    totalBudget: 31100,
    timeEstimate: '1-2 weekends',
    difficulty: 'Medium',
  },
};
