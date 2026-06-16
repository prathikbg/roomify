/**
 * Affiliate Link Generator
 * ========================
 * 
 * HOW TO USE YOUR OWN AFFILIATE ID:
 * Replace 'roomify0c-21' below with your actual Amazon Associates tracking ID.
 * 
 * To get your Amazon India affiliate ID:
 * 1. Sign up at https://affiliate-program.amazon.in/
 * 2. Create a tracking ID (e.g., "yoursite0c-21")
 * 3. Replace the constant below
 * 
 * You earn 1-10% commission on every purchase made through these links.
 * 
 * EXAMPLE COMMISSIONS (approximate):
 * - Furniture: 5-6% (₹1,000 on ₹20,000 bed)
 * - Home Decor: 8-10% (₹250 on ₹2,500 lamp)
 * - Kitchen: 6-8% (₹2,100 on ₹30,000 island)
 */

const AMAZON_AFFILIATE_TAG = '5010b3-21';

/**
 * Generates an Amazon India affiliate search link for a product keyword.
 * Uses search links (instead of direct product links) so products are always in stock
 * and users can choose the exact variant they want.
 */
export function amazonLink(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.amazon.in/s?k=${encoded}&tag=${AMAZON_AFFILIATE_TAG}`;
}

/**
 * Generates an Amazon India affiliate link for a specific product by ASIN.
 * Use this when you want to link to a specific product page.
 * 
 * To find a product's ASIN:
 * 1. Go to the product page on Amazon.in
 * 2. Look for "ASIN" in the product details section
 * 3. Pass it to this function
 */
export function amazonProductLink(asin: string): string {
  return `https://www.amazon.in/dp/${asin}?tag=${AMAZON_AFFILIATE_TAG}`;
}

/**
 * Generates a Pepperfry affiliate link.
 * Sign up at: https://www.pepperfry.com/affiliate
 */
export function pepperfryLink(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.pepperfry.com/search/?q=${encoded}`;
}

/**
 * Generates an Urban Ladder affiliate link.
 * Sign up at: https://www.urbanladder.com/affiliate
 */
export function urbanLadderLink(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.urbanladder.com/search/?q=${encoded}`;
}

/**
 * Generates an IKEA India affiliate link.
 */
export function ikeaLink(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://www.ikea.com/in/en/search/?q=${encoded}`;
}

/**
 * Pick the best store for a product category.
 * Returns Amazon by default, but can be customized.
 */
export function bestStoreLink(productName: string, _category: string): string {
  // Default to Amazon India with affiliate tag
  return amazonLink(productName);
}
