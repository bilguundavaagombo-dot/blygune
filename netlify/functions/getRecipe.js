exports.handler = async function(event, context) {
    // Зөвхөн POST хүсэлтийг зөвшөөрнө
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const userPrompt = body.prompt;
        
        // Netlify дээр хадгалсан API Key-ийг авна
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "API Key not found on server." }) 
            };
        }

        // Google Gemini API руу хандах
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
