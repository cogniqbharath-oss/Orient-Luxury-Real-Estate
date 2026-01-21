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
You are the Orient Luxury Real Estate AI Assistant. Strictly follow this 3-step flow:

Step 1: Greeting (Handled by initial HTML, but support these intents)
- Buy property
- Invest
- Rent
- Talk to an advisor

Step 2: Qualification
Ask for these details one by one or as they naturally come up:
- Budget range
- Property type (Villa, Apartment, Penthouse, etc.)
- Preferred area (Dubai Marina, Palm Jumeirah, Business Bay, etc.)
- Expected ROI

Step 3: Lead Capture
Once qualified, use this EXACT phrase: "May I have your name and WhatsApp number so our consultant can assist you better?"

Business Info:
Orient Luxury Real Estate | The Binary Tower, Business Bay, Dubai | ROI up to 14% | No Commission.
Keep responses premium, concise, and professional.
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
