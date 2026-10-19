// Talks to Google's Gemini API. Kept in its own file so the rest of the app
// never needs to know which AI provider is being used.
//
// We call the REST endpoint directly with fetch (built into Node 18+),
// so no extra npm package is needed.

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";


const askGemini = async (systemInstruction, question) => {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {

        const error = new Error("AI assistant is not configured on the server");
        error.statusCode = 503;
        throw error;

    }

    // The model name can be changed from the environment without touching
    // code, in case Google retires or renames a model.
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";


    let response;

    try {

        response = await fetch(
            `${GEMINI_BASE_URL}/${model}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // The key goes in a header, never in the URL, so it
                    // doesn't end up in logs.
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: question }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 600
                    }
                }),
                // Don't let a slow AI call hang the request forever.
                signal: AbortSignal.timeout(20000)
            }
        );

    } catch {

        const error = new Error("The AI service did not respond. Please try again.");
        error.statusCode = 502;
        throw error;

    }


    if (!response.ok) {

        // Log the real reason on the server, but show the user a safe message.
        const details = await response.text().catch(() => "");
        console.error("Gemini API error:", response.status, details);

        const error = new Error(
            response.status === 429
                ? "The AI service is busy right now. Please try again in a minute."
                : "The AI service returned an error. Please try again."
        );
        error.statusCode = response.status === 429 ? 429 : 502;
        throw error;

    }


    const data = await response.json();

    const text =
        data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();


    if (!text) {

        const error = new Error("The AI could not produce an answer. Try rephrasing your question.");
        error.statusCode = 502;
        throw error;

    }


    return text;

};


module.exports = { askGemini };
