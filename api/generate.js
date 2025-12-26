export const config = {
  runtime: 'edge', // Энэ нь кодыг маш хурдан ажиллуулна
};

export default async function handler(req) {
  // Зөвхөн POST хүсэлт хүлээн авна
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    // Vercel-ийн тохиргооноос API түлхүүрийг авна
    // Бид олон түлхүүр ашиглаж байгаа тул эндээс санамсаргүйгээр сонгоно
    const apiKeys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
    
    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Server configuration error: No API keys found' }), { status: 500 });
    }

    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)].trim();

    // Google Gemini API руу серверээс хүсэлт илгээх
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${randomKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // Алдаа гарвал буцаах
    if (data.error) {
        return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    // Амжилттай бол хариуг буцаах
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
