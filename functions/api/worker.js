export async function onRequest(context) {
    const { request, env } = context;

    // CORS Headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle OPTIONS (Preflight)
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
        const { message, chatHistory } = await request.json();

        const systemPrompt = `
You are the Orient Luxury Real Estate AI Assistant. Your goal is to qualify investors and match them with luxury properties in Dubai.
Business Name: Orient Luxury Real Estate
Location: The Binary Tower, Business Bay, Dubai
Contact: +971 58 662 2184
Offers: ROI up to 14%, No Commission, Direct from Developers.

Chatbot Objectives:
1. Greet visitors warmly.
2. Ask intent (Buy / Invest / Rent).
3. Ask budget (e.g., $500k, $1M+).
4. Ask location preference (e.g., Business Bay, Palm Jumeirah).
5. Capture contact details.
6. Route hot leads to WhatsApp (+971 58 662 2184).

Keep responses professional, premium, and concise. If the user seems ready, encourage them to click the WhatsApp button or provide their phone number.
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${env.API_KEY_orient}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    ...(chatHistory || []),
                    { role: "user", parts: [{ text: message }] }
                ]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ response: aiResponse }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}
