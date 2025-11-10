import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBoardThumbnail(): Promise<string | null> {
  try {
    const prompts = [
      'Abstract minimalist brush strokes in vibrant blue and purple gradients, geometric shapes overlapping, modern digital art style, clean composition with negative space',
      'Colorful watercolor-style brush strokes in warm orange and pink tones, flowing organic shapes, contemporary art aesthetic, minimalist composition',
      'Bold geometric abstract art with teal and coral brush strokes, modern minimalist design, clean lines and shapes, professional whiteboard aesthetic',
      'Abstract expressionist brush strokes in emerald green and golden yellow, dynamic composition, contemporary digital art',
      'Vibrant abstract art with magenta and cyan brush strokes, minimalist modern style, geometric patterns',
      'Soft pastel abstract composition with lavender and mint green brush strokes, organic flowing shapes, minimalist design',
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: randomPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return null;
  }
}
