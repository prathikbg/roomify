/**
 * AI Image Generator Utility
 * ==========================
 *
 * CURRENTLY: Uses pre-generated gallery images as placeholders.
 *
 * TO USE A REAL AI MODEL: Replace the generateImage() function body
 * with a call to any of the supported AI APIs below.
 *
 * SUPPORTED AI PROVIDERS:
 * - OpenAI DALL-E 3 (Recommended - best quality)
 * - Stability AI Stable Diffusion XL
 * - Midjourney API (via third-party wrappers)
 * - Leonardo AI
 * - Replicate (run any model)
 * - Amazon Bedrock (Titan Image Generator)
 */

// Pre-generated room makeover images by style (fallback/demo mode)
const styleImages: Record<string, string> = {
  modern: '/images/rooms/room1-back.jpg',
  scandinavian: '/images/rooms/room2-back.jpg',
  japandi: '/images/rooms/room3-back.jpg',
  luxury: '/images/rooms/room4-back.jpg',
  boho: '/images/gallery/item1.jpg',
  industrial: '/images/gallery/item2.jpg',
  'traditional-indian': '/images/gallery/item3.jpg',
  'smart-home': '/images/gallery/item4.jpg',
};

/**
 * ============================================================
 * OPTION 1: OpenAI DALL-E 3 (Recommended - Best Quality)
 * ============================================================
 * Cost: ~$0.04 per image (1024x1024)
 * Quality: Excellent for interior design
 * Speed: 5-10 seconds
 *
 * Setup:
 *   npm install openai
 *
 * Code:
 *   import OpenAI from 'openai';
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *
 *   const response = await openai.images.generate({
 *     model: "dall-e-3",
 *     prompt: prompt,
 *     size: "1024x1024",
 *     quality: "hd",
 *     n: 1,
 *   });
 *   return response.data[0].url;
 *
 * ============================================================
 * OPTION 2: Stability AI Stable Diffusion XL
 * ============================================================
 * Cost: ~$0.01 per image
 * Quality: Good, fast
 * Speed: 2-5 seconds
 *
 * Setup:
 *   npm install stability-client
 *
 * Code:
 *   const response = await fetch(
 *     'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
 *     {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
 *       },
 *       body: JSON.stringify({
 *         text_prompts: [{ text: prompt, weight: 1 }],
 *         cfg_scale: 7,
 *         steps: 30,
 *         width: 1024,
 *         height: 1024,
 *       }),
 *     }
 *   );
 *   const data = await response.json();
 *   return `data:image/png;base64,${data.artifacts[0].base64}`;
 *
 * ============================================================
 * OPTION 3: Replicate (Run Any Model)
 * ============================================================
 * Cost: Varies by model (~$0.01-0.05)
 * Quality: Depends on chosen model
 *
 * Setup:
 *   npm install replicate
 *
 * Code:
 *   import Replicate from 'replicate';
 *   const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
 *
 *   const output = await replicate.run(
 *     "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
 *     { input: { prompt: prompt, width: 1024, height: 1024 } }
 *   );
 *   return output[0]; // URL to generated image
 *
 * ============================================================
 * OPTION 4: Leonardo AI (Free tier available)
 * ============================================================
 * Cost: Free 150 tokens/day, then ~$0.01/image
 * Quality: Excellent for interiors
 *
 * Setup:
 *   // No SDK needed - REST API
 *
 * Code:
 *   const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
 *     },
 *     body: JSON.stringify({
 *       prompt: prompt,
 *       modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f34d3', // Leonardo Diffusion XL
 *       width: 1024,
 *       height: 1024,
 *       num_images: 1,
 *     }),
 *   });
 *   const data = await response.json();
 *   return data.generations_by_pk.generated_images[0].url;
 *
 * ============================================================
 */

/**
 * Generates a room makeover image.
 *
 * CURRENT: Returns a pre-generated gallery image.
 * TO USE AI: Replace the body of this function with any Option above.
 */
export async function generateImage(
  prompt: string,
  _width?: number,
  _height?: number
): Promise<string> {
  // Simulate realistic network delay (2-4 seconds for AI generation)
  await new Promise((resolve) => setTimeout(resolve, 2500 + Math.random() * 1500));

  // Match style from prompt to our gallery
  for (const [style, path] of Object.entries(styleImages)) {
    if (prompt.toLowerCase().includes(style.toLowerCase())) {
      return path;
    }
  }

  return styleImages.modern;
}

/**
 * Generates a Pinterest-ready composite image (1000x1500px).
 * Uses HTML Canvas to combine before/after with title overlay.
 */
export function generatePinterestImage(
  beforeSrc: string,
  afterSrc: string,
  title: string,
  styleLabel: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(beforeSrc);
      return;
    }

    // Dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 1000, 1500);

    // Header text
    ctx.font = '400 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f25b29';
    ctx.textAlign = 'center';
    ctx.fillText('ROOMIFY.AI', 500, 80);

    ctx.font = '400 12px "Inter", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('AI-POWERED ROOM MAKEOVER', 500, 110);

    const beforeImg = new Image();
    const afterImg = new Image();
    beforeImg.crossOrigin = 'anonymous';
    afterImg.crossOrigin = 'anonymous';

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;

      const imgH = 580;
      const imgW = 440;
      const gap = 30;
      const startY = 150;

      // Before image
      ctx.drawImage(beforeImg, (500 - imgW - gap / 2), startY, imgW, imgH);
      // After image
      ctx.drawImage(afterImg, (500 + gap / 2), startY, imgW, imgH);

      // Labels
      ctx.font = '500 13px "Inter", sans-serif';
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText('BEFORE', (500 - gap / 2 - imgW / 2), startY - 12);
      ctx.fillStyle = '#f25b29';
      ctx.fillText('AFTER', (500 + gap / 2 + imgW / 2), startY - 12);

      // Divider line
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(500, startY - 5);
      ctx.lineTo(500, startY + imgH + 5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Border boxes
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect((500 - imgW - gap / 2), startY, imgW, imgH);
      ctx.strokeRect((500 + gap / 2), startY, imgW, imgH);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      const words = title.split(' ');
      let y = startY + imgH + 80;
      const maxWidth = 800;
      let line = '';
      let lineCount = 0;

      ctx.font = '400 38px "Playfair Display", Georgia, serif';
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), 500, y);
          line = words[i] + ' ';
          y += 52;
          lineCount++;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 500, y);

      // Style tag
      y += 55;
      ctx.font = '400 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f25b29';
      ctx.fillText(styleLabel.toUpperCase(), 500, y);

      // Divider
      y += 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(300, y);
      ctx.lineTo(700, y);
      ctx.stroke();

      // Footer
      ctx.font = '400 12px "Inter", sans-serif';
      ctx.fillStyle = '#555';
      ctx.fillText('roomify.ai  |  AI Room Makeover', 500, 1440);

      resolve(canvas.toDataURL('image/png'));
    };

    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;

    // Handle errors gracefully
    beforeImg.onerror = () => {
      loaded++;
      if (loaded >= 2) onLoad();
    };
    afterImg.onerror = () => {
      loaded++;
      if (loaded >= 2) onLoad();
    };

    beforeImg.src = beforeSrc;
    afterImg.src = afterSrc;
  });
}

/**
 * Uploads a user image to cloud storage.
 * CURRENT: Returns a data URL (local).
 * TO USE CLOUD: Replace with your storage provider (AWS S3, Cloudinary, Supabase, etc.)
 *
 * Cloudinary example:
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   formData.append('upload_preset', 'roomify_uploads');
 *   const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload', {
 *     method: 'POST',
 *     body: formData,
 *   });
 *   const data = await res.json();
 *   return data.secure_url;
 */
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}
