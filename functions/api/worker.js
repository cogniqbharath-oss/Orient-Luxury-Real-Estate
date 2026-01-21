export default {
    async fetch(request, env) {
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
You are the Orient Luxury Real Estate AI Assistant. 

STRICT RULES:
1. MAX 15 WORDS per response.
2. NEVER mention your identity or start with "Hello/Hi".
3. NEVER repeat options (Buy/Invest/Rent) once the user has started.
4. If they want an advisor, say ONLY: "Sure, here is our contact +971 58 662 2184. Please call on that number."
5. Move through flow: Ask for Budget -> Property type -> Area -> ROI -> Lead Capture.

Lead Capture phrase (use ONLY at the end): "May I have your name and WhatsApp number so our consultant can assist you better?"

Business: Orient Luxury Real Estate | Business Bay, Dubai | ROI up to 14%. No commission.
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
};
