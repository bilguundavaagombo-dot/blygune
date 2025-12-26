export default async function handler(req, res) {
    // 1. Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key missing' });
        }

        // 2. Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Using 4o-mini (Fast & Cheap)
                messages: [
                    { role: "system", content: "You are a helpful chef." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // 3. Check for OpenAI specific errors
        if (!response.ok) {
            console.error("OpenAI Error:", data);
            return res.status(500).json({ error: 'OpenAI Error' });
        }

        // 4. Send back just the text
        const aiText = data.choices[0].message.content;
        return res.status(200).json({ output: aiText });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: 'Error generating recipe' });
    }
}
