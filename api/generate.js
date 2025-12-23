// Файлын зам: api/generate.js

export const config = {
  runtime: 'edge', // Vercel Edge Function (Хурдан, 10сек хязгаарт өртөхгүй)
};

export default async function handler(req) {
  // Зөвхөн POST хүсэлт авна
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    // Vercel Settings дотор GEMINI_API_KEYS гэж хадгална
    // Олон түлхүүр байвал таслалаар тусгаарлана (KEY1,KEY2,KEY3)
    const keysString = process.env.GEMINI_API_KEYS;

    if (!keysString) {
      return new Response(JSON.stringify({ error: 'Server Config Error: API Keys missing.' }), { status: 500 });
    }

    // Түлхүүрүүдийг салгаж жагсаалт болгох
    const apiKeys = keysString.split(',').map(key => key.trim());
    
    // Түлхүүр эргүүлэх (Rotation) - Санамсаргүй нэгийг сонгоно
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    // gemini-1.5-flash модель ашиглана (Хамгийн тогтвортой, хурдан)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${randomKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    // Google-ээс ирсэн хариуг шалгах
    if (!response.ok) {
        const errText = await response.text();
        return new Response(JSON.stringify({ error: `Gemini API Error: ${response.status} - ${errText}` }), { status: response.status });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
