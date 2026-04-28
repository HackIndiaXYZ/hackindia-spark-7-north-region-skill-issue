import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';
import { Plan, Event, Day } from './storage.service';
import { lookupSafety } from './safetyData';
import { buildTripContext, getDestinationProfile, getRouteProfile } from './tripData';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    baseURL: 'https://api.mistral.ai/v1',
    apiKey: process.env.MISTRAL_API_KEY || '',
});

const NVIDIA_MODEL = 'codestral-latest';

// // Groq client — used for itinerary generation and budget estimation
// const groqClient = new OpenAI({
//     baseURL: 'https://api.groq.com/openai/v1',
//     apiKey: process.env.GROQ_API_KEY || '',
// });
// const GROQ_PLAN_MODEL   = 'meta-llama/llama-4-scout-17b-16e-instruct';
// const GROQ_BUDGET_MODEL = 'llama-3.1-8b-instant';

// Cloudflare Workers AI client — used for itinerary generation and budget estimation
const openRouterClient = new OpenAI({
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    apiKey: process.env.CLOUDFLARE_API_TOKEN || '',
});
const MISTRAL_PLAN_MODEL   = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MISTRAL_BUDGET_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// Groq client — used for local phrases
const groqPhrasesClient = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
});
const GROQ_PHRASES_MODEL = 'llama-3.1-8b-instant';

// JSON schema descriptions kept for prompt injection (NVIDIA NIM doesn't support responseSchema natively like Gemini)
const responseSchemaDescription = `{
  "totalEstimatedCost": number,
  "destination": string,
  "transportLogistics": {
    "estimatedTime": string,
    "estimatedPrice": number (TOTAL cost for entire group, same convention as estimatedCost in events),
    "availabilityStatus": string
  },
  "days": [
    {
      "dayNumber": number,
      "date": string,
      "weatherInfo": string,
      "events": [
        {
          "id": string (uuid format),
          "time": string (HH:MM AM/PM),
          "title": string,
          "description": string,
          "durationMinutes": number,
          "estimatedCost": number (REQUIRED — use 0 for free items, NEVER null or undefined or empty string),
          "type": string ("activity" or "transport"),
          "lat": number (exact geographic latitude),
          "lon": number (exact geographic longitude)
        }
      ]
    }
  ]
}`;

const eventSchemaDescription = `{
  "id": string (uuid),
  "time": string (HH:MM AM/PM),
  "title": string,
  "description": string,
  "durationMinutes": number,
  "estimatedCost": number,
  "type": string ("activity" or "transport"),
  "lat": number,
  "lon": number
}`;

// // Groq streaming call — fast inference, used for planning and budget
// const callGroq = async (
//     messages: OpenAI.Chat.ChatCompletionMessageParam[],
//     model: string,
//     maxTokens = 4096,
//     temperature = 0.3,
//     maxRetries = 2
// ): Promise<string> => {
//     let attempt = 0;
//     while (attempt < maxRetries) {
//         try {
//             const stream = await groqClient.chat.completions.create(
//                 { model, messages, temperature, top_p: 0.9, max_tokens: maxTokens, stream: true as const },
//                 { signal: AbortSignal.timeout(60000) }
//             );
//             let content = '';
//             for await (const chunk of stream) {
//                 const delta = chunk.choices[0]?.delta as any;
//                 if (delta?.content) content += delta.content;
//             }
//             if (!content) throw new Error('Empty Groq response');
//             return content;
//         } catch (error: any) {
//             console.log(`[Groq] attempt ${attempt + 1} failed: ${error.message}`);
//             attempt++;
//             if (attempt >= maxRetries) throw new Error(`Groq failed after ${maxRetries} attempts: ${error.message}`);
//             await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
//         }
//     }
//     throw new Error('Groq: max retries exceeded');
// };

// Gemma (Google AI Studio) doesn't support the system role — merge it into the first user message
const mergeSystemIntoUser = (messages: OpenAI.Chat.ChatCompletionMessageParam[]): OpenAI.Chat.ChatCompletionMessageParam[] => {
    const systemMsg = messages.find(m => m.role === 'system');
    if (!systemMsg) return messages;
    const systemContent = typeof systemMsg.content === 'string' ? systemMsg.content : '';
    const rest = messages.filter(m => m.role !== 'system');
    const firstUser = rest.find(m => m.role === 'user');
    if (!firstUser) return rest;
    const userContent = typeof firstUser.content === 'string' ? firstUser.content : '';
    return rest.map(m =>
        m === firstUser ? { ...m, content: `${systemContent}\n\n${userContent}` } : m
    );
};

// Google AI Studio call — used for itinerary generation and budget estimation
const callMistral = async (
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    model: string,
    maxTokens = 4096,
    temperature = 0.3,
    maxRetries = 2
): Promise<string> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const stream = await openRouterClient.chat.completions.create(
                { model, messages: mergeSystemIntoUser(messages), temperature, max_tokens: maxTokens, stream: true as const },
                { signal: AbortSignal.timeout(60000) }
            );
            let content = '';
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta as any;
                if (delta?.content) content += delta.content;
            }
            if (!content) throw new Error('Empty OpenRouter response');
            return content;
        } catch (error: any) {
            console.log(`[OpenRouter] attempt ${attempt + 1} failed: ${error.message}`);
            attempt++;
            if (attempt >= maxRetries) throw new Error(`OpenRouter failed after ${maxRetries} attempts: ${error.message}`);
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        }
    }
    throw new Error('OpenRouter: max retries exceeded');
};

// Wrapper with retry — uses streaming so the connection stays alive while
// kimi-k2-thinking reasons (reasoning_content) before emitting content.
const callNvidiaWithRetry = async (messages: OpenAI.Chat.ChatCompletionMessageParam[], maxRetries = 2, temperature = 0.3): Promise<string> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const stream = await client.chat.completions.create(
                {
                    model: NVIDIA_MODEL,
                    messages,
                    temperature,
                    top_p: 0.9,
                    max_tokens: 16384,
                    stream: true as const,
                },
                { signal: AbortSignal.timeout(120000) }
            );

            let content = '';
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta as any;
                if (delta?.content) content += delta.content;
            }

            if (!content) throw new Error("Empty response from NVIDIA API");
            return content;
        } catch (error: any) {
            console.log(`[AI Service] NVIDIA API attempt ${attempt + 1} failed: ${error.message}`);
            attempt++;
            if (attempt >= maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            }
            const waitTime = Math.pow(2, attempt) * 800;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    throw new Error("Failed to generate content after max retries.");
};

// Extract JSON string from LLM output (strips markdown fences / <think> tokens)
const extractJSON = (raw: string): string => {
    const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const jsonMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) return jsonMatch[1].trim();
    const firstBrace = stripped.indexOf('{');
    const lastBrace = stripped.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        return stripped.substring(firstBrace, lastBrace + 1);
    }
    return stripped;
};

// Parse JSON, auto-repairing common LLM syntax errors (missing commas, trailing commas, etc.)
const parseJSON = (raw: string): any => {
    const jsonStr = extractJSON(raw);
    try {
        return JSON.parse(jsonStr);
    } catch {
        return JSON.parse(jsonrepair(jsonStr));
    }
};

export const generateItineraryFromAI = async (
    origin: string,
    destination: string,
    startDate: string,
    endDate: string,
    budget: number | string,
    vibe: string,
    transportMode: string,
    weatherContext: string,
    group?: string,
    gemsMode?: string,
    travelers?: string
): Promise<Omit<Plan, 'planId' | 'origin' | 'transportMode'>> => {
    const hasBaby   = /baby|infant/i.test(travelers ?? '');
    const hasChild  = /child|kid/i.test(travelers ?? '');
    const isSenior  = /senior/i.test(group ?? '');

    const travelerNote = travelers ? `- Travelers: ${travelers}` : '';
    const babyNote = hasBaby
        ? '- IMPORTANT: There is a baby/infant in the group. Schedule frequent rest breaks (every 2–3 hours), avoid long activity slots over 90 minutes, include baby-friendly venues, plan nap windows mid-morning and after lunch, and prefer accessible locations.'
        : hasChild
        ? '- There are young children. Keep activity slots under 2 hours, include kid-friendly stops, and avoid overly strenuous activities.'
        : isSenior
        ? '- There are senior travelers. Prefer accessible sites, avoid strenuous trekking, include rest periods, and choose comfortable transport.'
        : '';

    // Compute exact trip length, transit days, and enumerate every date explicitly
    const msPerDay = 86400000;
    const tripDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay) + 1;

    const route = getRouteProfile(origin, destination);
    const isBus    = /bus|volvo/i.test(transportMode);
    const isFlight = /flight|fly|air/i.test(transportMode);
    const rawTransitH = route
        ? (isFlight ? route.flightTimeH || 2 : isBus ? route.busTimeH : route.driveTimeH)
        : (isFlight ? 2 : isBus ? 18 : 6);
    const transitDays = Math.min(Math.ceil(rawTransitH / 16), tripDays - 1); // always leave at least 1 activity day
    const activityDays = tripDays - transitDays;

    // Build explicit day-by-day schedule blueprint
    const dayBlueprint = Array.from({ length: tripDays }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayNum = i + 1;
        if (dayNum <= transitDays) {
            const label = dayNum === 1 ? `Depart ${origin} by ${transportMode}`
                : dayNum === transitDays ? `Arrive ${destination}`
                : `In transit`;
            return `  Day ${dayNum} (${dateStr}): TRANSIT — ${label}. Only transport events.`;
        }
        return `  Day ${dayNum} (${dateStr}): ACTIVITIES at ${destination} — schedule breakfast (08:00–09:00), 2 morning activities, lunch (13:00–14:00), 1–2 afternoon activities, dinner (19:00–20:00). Minimum 4 events.`;
    }).join('\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are an expert travel planner specializing in India route logistics with deep knowledge of real road distances, transport times, and local prices.

MANDATORY DAY STRUCTURE — you MUST generate exactly these ${tripDays} days with the exact dates shown:
${dayBlueprint}

RULES:
- Every day listed above MUST appear in the output with the exact date. No days can be skipped or merged.
- Activity days MUST each have at least 4 events spread across morning, afternoon, and evening.
- Distribute activities equally — do NOT cluster all sightseeing on one day and leave others empty.
- Transit days contain ONLY transport events (no sightseeing, no meals at destination).
- Never place two events at locations far apart within the same hour.

You MUST respond with ONLY valid JSON matching this exact schema:\n${responseSchemaDescription}\nDo NOT include any text outside the JSON object. No markdown, no explanation.`
        },
        {
            role: 'user',
            content: `Create an itinerary from ${origin} to ${destination} spanning ${startDate} to ${endDate}.
CRITICAL RULE: The destination MUST be within India. If not, pivot to a similar Indian destination.

${buildTripContext(origin, destination, transportMode, travelers || '2 adults', budget)}

Traveler constraints:
- Mode of Transport: ${transportMode}
- Total Budget: ₹${budget} for the ENTIRE GROUP. HARD LIMIT: totalEstimatedCost ≤ ₹${budget}. Use the real prices above — pick mid-range of the given range as default. Sum of all event costs must not exceed ₹${budget}.
- Desired Vibe: ${vibe}
- Group: ${group || 'solo'}
${travelerNote}
${babyNote}
- Experience mode: ${gemsMode === 'hidden' ? 'Hidden gems and local favourites — avoid tourist traps' : 'Popular tourist attractions'}

${weatherContext || ''}

AI TASK:
1. Generate exactly ${tripDays} day objects using the day blueprint above — one day per date, no skipping.
2. For each of the ${activityDays} activity days: spread different attractions, areas, and experiences. Do NOT repeat the same place across days.
3. For transportLogistics.estimatedPrice: multiply per-person fare by number of travelers for bus/flight; use full vehicle rate for cab.
4. Use REAL entry fees and meal costs from the data above. Do NOT invent prices.
5. type must be exactly "activity" or "transport".
6. Provide accurate real-world lat/lon for every event.
7. Generate unique UUID-format IDs for each event.
8. All estimatedCost values are for the ENTIRE GROUP — never null, use 0 for free items.
9. Event descriptions must be properly spaced (e.g. "stopover for 2 hours" not "stopover for2 hours").`
        }
    ];

    const raw = await callMistral(messages, MISTRAL_PLAN_MODEL, 8192, 0.3);
    const parsed = parseJSON(raw);

    // Sanitise: ensure every event has a numeric estimatedCost (never null/undefined)
    parsed?.days?.forEach((day: any) => {
        day?.events?.forEach((ev: any) => {
            if (ev.estimatedCost == null || typeof ev.estimatedCost !== 'number') {
                ev.estimatedCost = 0;
            }
        });
    });

    // Fill in any days the AI skipped so the frontend always gets tripDays day objects
    if (parsed?.days && parsed.days.length < tripDays) {
        for (let i = 0; i < tripDays; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().slice(0, 10);
            const exists = parsed.days.some((day: any) => day.date === dateStr || day.dayNumber === i + 1);
            if (!exists) {
                parsed.days.splice(i, 0, {
                    dayNumber: i + 1,
                    date: dateStr,
                    weatherInfo: '',
                    events: []
                });
            }
        }
        // Re-number days in order
        parsed.days.forEach((day: any, idx: number) => { day.dayNumber = idx + 1; });
    }

    return parsed;
};

const phrasesCache = new Map<string, any[]>();

export const generateLocalPhrases = async (destination: string): Promise<any[]> => {
    const key = destination.trim().toLowerCase();
    if (phrasesCache.has(key)) return phrasesCache.get(key)!;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are a language expert for Indian regional languages. Respond with ONLY a valid JSON array of exactly 7 objects: [{"native": string, "romanized": string, "meaning": string, "emoji": string}]. No markdown, no explanation.`
        },
        {
            role: 'user',
            content: `Generate 7 essential travel phrases for a tourist visiting ${destination}, India.
Use the PRIMARY local language of that region (NOT Hindi unless it is the main local language):
- Kerala → Malayalam
- Tamil Nadu → Tamil
- Karnataka → Kannada
- West Bengal / Darjeeling → Bengali
- Goa → Konkani
- Rajasthan / Delhi / UP / MP → Hindi
- Gujarat → Gujarati
- Maharashtra → Marathi
- Andhra Pradesh / Telangana → Telugu
- Punjab → Punjabi
- Odisha → Odia
- Assam / Northeast → Assamese

Include: a greeting, thank you, how much does it cost, where is…, I'm vegetarian, one local food/dish request, and one phrase specific to that destination's culture. Provide native script, romanized pronunciation, English meaning, and a relevant emoji.`
        }
    ];

    const stream = await groqPhrasesClient.chat.completions.create(
        { model: GROQ_PHRASES_MODEL, messages, temperature: 0.3, max_tokens: 512, stream: true as const },
        { signal: AbortSignal.timeout(20000) }
    );
    let raw = '';
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta as any;
        if (delta?.content) raw += delta.content;
    }
    const result = parseJSON(raw);
    phrasesCache.set(key, result);
    return result;
};

export const translatePhrase = async (text: string, destination: string): Promise<{ native: string; romanized: string; language: string }> => {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are an Indian language translation expert. Respond with ONLY valid JSON: {"native": string, "romanized": string, "language": string}. No markdown, no explanation.`
        },
        {
            role: 'user',
            content: `Translate this English text into the PRIMARY local language of ${destination}, India.
Language rules: Goa→Konkani, Kerala→Malayalam, Tamil Nadu→Tamil, Karnataka→Kannada, West Bengal→Bengali, Rajasthan/Delhi/UP/MP→Hindi, Gujarat→Gujarati, Maharashtra→Marathi, Andhra/Telangana→Telugu, Punjab→Punjabi.

Text: "${text}"

Return:
- "native": correct translation in the local script (e.g. देवनागरी for Hindi, தமிழ் for Tamil)
- "romanized": how to pronounce it written in English letters (Hinglish style, e.g. "Mera naam Angad hai")
- "language": language name (e.g. "Hindi", "Tamil")

Make sure the native script is accurate and the romanized is easy for an English speaker to read.`
        }
    ];
    const raw = await callMistral(messages, MISTRAL_BUDGET_MODEL, 200, 0.1);
    return parseJSON(raw);
};

export const generateAlternativeEvent = async (
    originalEvent: Event,
    contextDay: Day,
    rejectionReason?: string,
    destination?: string
): Promise<Event> => {
    const destProfile = destination ? getDestinationProfile(destination) : null;
    const priceContext = destProfile ? `
REAL PRICES for ${destination} (use these exactly — do NOT invent costs):
- Meal at street stall: ₹${destProfile.mealStreet} per person
- Meal at restaurant: ₹${destProfile.mealRestaurant} per person
- Local transport per day: ₹${destProfile.localTransportPerDay}
- Known attractions with fees: ${destProfile.attractions.map(a => `${a.name} ₹${a.fee}`).join(', ')}
- Notes: ${destProfile.notes}
estimatedCost must match these real prices for the group.` : '';

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are a travel agent. You MUST respond with ONLY valid JSON matching this exact schema:\n${eventSchemaDescription}\nDo NOT include any text outside the JSON object.`
        },
        {
            role: 'user',
            content: `Generate a single alternative event.
A user rejected this event on Day ${contextDay.dayNumber} avoiding weather: ${contextDay.weatherInfo}.
Rejected Event: ${JSON.stringify(originalEvent)}
Rejection Reason: ${rejectionReason || "Wants something different."}
Current Day Outline: ${JSON.stringify(contextDay.events.map(e => e.title))}
${priceContext}
Provide a SINGLE new replacement event matching the same time slot and geographical bounds but distinct from rejected.
Make sure type is exactly "activity" or "transport". Provide accurate 'lat' and 'lon' coordinates! Generate a unique UUID-format ID.`
        }
    ];

    const raw = await callNvidiaWithRetry(messages);
    return parseJSON(raw);
};

const surpriseSchemaDescription = `{
  "destination": string (city or location name),
  "description": string (why it's amazing to visit right now),
  "placesToVisit": [string, string, string] (3 top spots),
  "vibe": string (one of: "balanced", "foodie", "adventure", "culture", "chill")
}`;

const indianRegions = [
    'Rajasthan', 'Kerala backwaters', 'Northeast India (Meghalaya or Nagaland)',
    'Himachal Pradesh', 'Karnataka', 'Tamil Nadu', 'Uttarakhand',
    'Odisha', 'Gujarat', 'Andaman Islands', 'Sikkim', 'Madhya Pradesh',
    'West Bengal hill stations', 'Lakshadweep', 'Maharashtra forts',
    'Punjab and Amritsar region', 'Jammu and Kashmir', 'Telangana',
    'Chhattisgarh tribal belt', 'Arunachal Pradesh'
];

export const generateSurpriseDestination = async () => {
    const randomRegion = indianRegions[Math.floor(Math.random() * indianRegions.length)];
    const randomSeed = Math.floor(Math.random() * 9000) + 1000;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are an expert Indian travel guru specializing in hidden gems and offbeat destinations. You MUST respond with ONLY valid JSON matching this exact schema:\n${surpriseSchemaDescription}\nDo NOT include any text outside the JSON object.`
        },
        {
            role: 'user',
            content: `Request ID: ${randomSeed}. Focus your selection specifically on the ${randomRegion} region of India.
Pick exactly ONE unique, specific, and lesser-known destination within or near that region that is phenomenal to visit right now.
Avoid the most obvious tourist traps — choose something that would genuinely surprise a traveler.
Return a structured JSON with:
1. 'destination': The specific location name (town, village, valley, or region).
2. 'description': Tell me WHY it's amazing to visit right now (current season, local festivals, unique landscapes, or hidden features).
3. 'placesToVisit': Array of exactly 3 must-see spots there.
4. 'vibe': Assign the closest matching vibe (balanced, foodie, adventure, culture, chill).`
        }
    ];

    const raw = await callNvidiaWithRetry(messages, 2, 0.95);
    const jsonStr = extractJSON(raw);
    return JSON.parse(jsonStr);
};

const nearMeSchemaDescription = `{
  "detectedLocation": string (name of the neighborhood/city/area),
  "cafes": [
    { "name": string, "description": string (why it's worth visiting) }
  ] (3 items),
  "funPlaces": [
    { "name": string, "description": string (why it's fun or a hidden gem) }
  ] (3 items)
}`;

// Reverse-geocode lat/lng to a real location name using Nominatim (free, no API key)
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`,
            { headers: { 'User-Agent': 'Roamly/1.0' } }
        );
        if (!res.ok) return '';
        const data = await res.json();
        const addr = data.address || {};
        // Build a readable location string: suburb/neighbourhood, city/town, state
        const parts = [
            addr.suburb || addr.neighbourhood || addr.village || '',
            addr.city || addr.town || addr.county || '',
            addr.state || '',
            addr.country || ''
        ].filter(Boolean);
        return parts.join(', ') || data.display_name || '';
    } catch {
        return '';
    }
};

export const generateNearMeLocation = async (lat: number, lng: number) => {
    // Step 1: Reverse-geocode to get the actual location name
    const locationName = await reverseGeocode(lat, lng);
    const locationContext = locationName
        ? `The user is at: ${locationName} (GPS: ${lat}, ${lng}).`
        : `The user is at GPS coordinates: Latitude ${lat}, Longitude ${lng}.`;

    // Step 2: Use Mistral AI (via the existing Mistral client) for accurate recommendations
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are a hyper-local tour guide and expert city explorer specializing in India. You MUST respond with ONLY valid JSON matching this exact schema:\n${nearMeSchemaDescription}\nDo NOT include any text outside the JSON object.`
        },
        {
            role: 'user',
            content: `${locationContext}

Based on this EXACT real-world location, provide:
1. "detectedLocation": The specific neighborhood, area or city name (e.g. "${locationName || 'detected area'}").
2. "cafes": 3 of the BEST, highly-rated cafes, restaurants, or food spots that actually exist near this location. Include real, well-known places — not made-up names. Describe why each is worth visiting.
3. "funPlaces": 3 FUN places, hidden gems, landmarks, parks, or cool activities to do right now in that exact area. These must be real places that exist near the location.

Return strictly as structured JSON following the schema. All place names must be REAL and verifiable.`
        }
    ];

    const raw = await callNvidiaWithRetry(messages);
    return parseJSON(raw);
};

const safetyCache = new Map<string, { score: number; label: string; details: string }>();

export const generateSafetyScore = async (destination: string) => {
    const key = destination.trim().toLowerCase();
    if (safetyCache.has(key)) return safetyCache.get(key)!;

    // Use real Numbeo data when available
    const fromTable = lookupSafety(destination);
    if (fromTable) {
        safetyCache.set(key, fromTable);
        return fromTable;
    }

    // Fall back to AI for destinations not in the table
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are a travel safety analyst using the Numbeo Safety Index scale (0–100). Respond with ONLY valid JSON: {"score": number, "label": "Use Caution"|"Moderate"|"Safe"|"Very Safe", "details": string (one concise sentence advisory for tourists)}

Scoring rules:
- 70+  → "Very Safe"
- 57–69 → "Safe"
- 45–56 → "Moderate"
- below 45 → "Use Caution"

Real Numbeo Safety Index benchmarks for Indian cities (use these to calibrate your answer):
Mangalore 74.2, Vadodara 69.2, Ahmedabad 68.2, Surat 66.6, Jaipur 65.2, Navi Mumbai 63.5, Thiruvananthapuram 61.1, Chennai 60.3, Pune 58.7, Chandigarh 57.4, Kolkata 54.3, Hyderabad 53.8, Mumbai 52.1, Bengaluru 50.9, Delhi 47.3.

Most Indian tourist destinations fall between 45 and 75. Do NOT give scores above 78.`
        },
        {
            role: 'user',
            content: `Using the Numbeo Safety Index scale, estimate the safety score for ${destination}, India. Consider crime rates, solo traveller safety, local policing, and tourist infrastructure relative to the benchmark cities above. Return the JSON.`
        }
    ];

    const raw = await callNvidiaWithRetry(messages, 2, 0.2);
    const result = parseJSON(raw);
    safetyCache.set(key, result);
    return result;
};

// ── Budget Estimation via Groq ───────────────────────────────────────────────

export interface BudgetEstimate {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    miscellaneous: number;
    totalEstimated: number;
    assessment: 'tight' | 'comfortable' | 'generous';
    tips: string[];
}

const budgetSchema = `{
  "transport": number,
  "accommodation": number,
  "food": number,
  "activities": number,
  "miscellaneous": number,
  "totalEstimated": number,
  "assessment": "tight" | "comfortable" | "generous",
  "tips": [string, string, string]
}`;

export const estimateBudget = async (params: {
    destination: string;
    origin: string;
    tripDays: number;
    travelers: string;
    transportMode: string;
    userBudget: number;
    aiTotalCost: number;
}): Promise<BudgetEstimate> => {
    const cap = params.userBudget;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: `You are an expert Indian travel budget analyst. Respond with ONLY valid JSON matching this exact schema:\n${budgetSchema}\nNo markdown, no explanation. CRITICAL: totalEstimated MUST NOT exceed ₹${cap}.`,
        },
        {
            role: 'user',
            content: `Estimate a realistic budget breakdown using the REAL prices below:

${buildTripContext(params.origin, params.destination, params.transportMode, params.travelers, params.userBudget)}

Trip details:
- Duration: ${params.tripDays} days
- AI itinerary cost: ₹${params.aiTotalCost}
- HARD CAP: ₹${cap}

Break into: transport (use mid of real range above), accommodation (${params.tripDays - 1} nights, mid-range), food (3 meals/day/person using real meal costs), activities (sum real entry fees), miscellaneous.
totalEstimated must be ≤ ₹${cap}.
assessment = "tight" if cap < totalEstimated*1.1, "generous" if cap > totalEstimated*1.4, else "comfortable".
Give 3 practical money-saving tips specific to ${params.destination} based on the real prices above.`,
        },
    ];

    const raw = await callMistral(messages, MISTRAL_BUDGET_MODEL, 512, 0.2);
    const result = parseJSON(raw) as BudgetEstimate;
    // Enforce cap on the response even if model ignores it
    if (result.totalEstimated > cap) result.totalEstimated = cap;
    return result;
};
