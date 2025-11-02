import OpenAI from "openai";

const CAPTAIN_API_KEY = process.env.CAPTAIN_API_KEY || "YOUR_CAPTAIN_API_KEY";
const CAPTAIN_ORG_ID = process.env.CAPTAIN_ORG_ID || "YOUR_ORG_ID";

export const captainClient = new OpenAI({
    baseURL: "https://api.runcaptain.com/v1",
    apiKey: CAPTAIN_API_KEY,
    defaultHeaders: {
        "X-Organization-ID": CAPTAIN_ORG_ID
    }
});

export async function captainChat({ messages, context = "", model = "captain-voyager-latest" }) {
    return await captainClient.chat.completions.create({
        model,
        messages,
        extra_body: {
            captain: {
                context
            }
        }
    });
}
