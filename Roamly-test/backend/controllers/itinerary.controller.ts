import { Request, Response } from 'express';
import { z } from 'zod';
import { savePlan, getPlan, updatePlan, generateId } from '../services/storage.service';
import { generateItineraryFromAI, generateAlternativeEvent, generateSurpriseDestination, generateNearMeLocation, generateSafetyScore, generateLocalPhrases, estimateBudget, translatePhrase } from '../services/ai.service';
import { getCoordinates } from '../services/places.service';
import { getWeatherForecast } from '../services/weather.service';
import { getRouteProfile, getDestinationProfile } from '../services/tripData';

const generateSchema = z.object({
    origin: z.string().min(2),
    destination: z.string().min(2),
    transportMode: z.string().min(2),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.union([z.string(), z.number()]),
    vibe: z.string().min(2),
    group: z.string().optional(),
    gemsMode: z.string().optional(),
    travelers: z.string().optional(),
});

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([promise, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);

export const generateItinerary = async (req: Request, res: Response) => {
    // Stream progress to the frontend via SSE so the user sees live steps
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (event: object) => {
        if (!res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
        let validated: z.infer<typeof generateSchema>;
        try {
            validated = generateSchema.parse(req.body);
        } catch (zodErr: any) {
            send({ status: 'error', error: zodErr.errors });
            return res.end();
        }

        const { origin, destination, transportMode, startDate, endDate, budget, vibe, group, gemsMode, travelers } = validated;

        if (!process.env.CLOUDFLARE_API_TOKEN) {
            send({ status: 'error', error: 'Missing CLOUDFLARE_API_TOKEN' });
            return res.end();
        }

        // Step 1 — geocode destination (4s max)
        send({ status: 'locating' });
        const coords = await withTimeout(getCoordinates(destination), 4000, null);

        // Step 2 — weather forecast (4s max, skip if coords unavailable)
        let weatherContext = '';
        if (coords) {
            send({ status: 'weather' });
            weatherContext = await withTimeout(
                getWeatherForecast(coords.lat, coords.lng, startDate, endDate),
                4000, ''
            );
        }

        // Step 3 — AI generation
        send({ status: 'generating' });
        const generatedData = await generateItineraryFromAI(
            origin, destination, startDate, endDate, budget, vibe,
            transportMode, weatherContext, group, gemsMode, travelers
        );

        const planId = generateId();
        const fullPlan = { ...generatedData, planId, origin, transportMode };
        savePlan(fullPlan);

        send({ status: 'complete', plan: fullPlan });
    } catch (error: any) {
        send({ status: 'error', error: error.message });
    } finally {
        res.end();
    }
};

const replanSchema = z.object({
    planId: z.string(),
    eventIdToReplace: z.string(),
    rejectionReason: z.string().optional()
});

export const replanEvent = async (req: Request, res: Response) => {
    try {
        const validated = replanSchema.parse(req.body);
        const { planId, eventIdToReplace, rejectionReason } = validated;

        const plan = getPlan(planId);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        let targetEvent = null;
        let dayContext = null;

        for (const day of plan.days) {
            const evIndex = day.events.findIndex(e => e.id === eventIdToReplace);
            if (evIndex !== -1) {
                targetEvent = day.events[evIndex];
                dayContext = day;
                break;
            }
        }

        if (!targetEvent || !dayContext) {
            return res.status(404).json({ error: "Event not found inside plan" });
        }

        if (!process.env.MISTRAL_API_KEY) {
             return res.status(500).json({ error: "Missing MISTRAL_API_KEY. Cannot call LLM." });
        }

        const newEvent = await generateAlternativeEvent(targetEvent, dayContext, rejectionReason, plan.destination);
        
        const eventIndex = dayContext.events.findIndex(e => e.id === eventIdToReplace);
        dayContext.events[eventIndex] = newEvent;
        
        updatePlan(planId, plan);

        return res.status(200).json({ newEvent, fullPlan: plan });
    } catch (error: any) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: error.message });
    }
};

export const generateSurprise = async (req: Request, res: Response) => {
    try {
        if (!process.env.MISTRAL_API_KEY) {
             return res.status(500).json({ error: "Missing MISTRAL_API_KEY." });
        }

        const surpriseData = await generateSurpriseDestination();
        res.set('Cache-Control', 'no-store');
        return res.status(200).json(surpriseData);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

const nearMeSchemaValidation = z.object({
    lat: z.number(),
    lng: z.number()
});

export const generateNearMe = async (req: Request, res: Response) => {
    try {
        const validated = nearMeSchemaValidation.parse(req.body);
        const { lat, lng } = validated;

        if (!process.env.MISTRAL_API_KEY) {
             return res.status(500).json({ error: "Missing MISTRAL_API_KEY." });
        }

        const nearMeData = await generateNearMeLocation(lat, lng);
        return res.status(200).json(nearMeData);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        return res.status(500).json({ error: error.message });
    }
};

export const getSafetyScore = async (req: Request, res: Response) => {
    try {
        const destination = (req.query.destination as string)?.trim();
        if (!destination) return res.status(400).json({ error: 'Missing destination query param' });
        if (!process.env.MISTRAL_API_KEY) return res.status(500).json({ error: 'Missing MISTRAL_API_KEY' });

        const result = await generateSafetyScore(destination);
        res.set('Cache-Control', 'public, max-age=3600');
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getLocalPhrases = async (req: Request, res: Response) => {
    try {
        const destination = (req.query.destination as string)?.trim();
        if (!destination) return res.status(400).json({ error: 'Missing destination query param' });
        if (!process.env.MISTRAL_API_KEY) return res.status(500).json({ error: 'Missing MISTRAL_API_KEY' });

        const phrases = await generateLocalPhrases(destination);
        res.set('Cache-Control', 'public, max-age=86400'); // cache 24h — phrases don't change
        return res.status(200).json(phrases);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getRouteCosts = (req: Request, res: Response) => {
    const origin      = (req.query.origin      as string)?.trim();
    const destination = (req.query.destination as string)?.trim();
    if (!origin || !destination) return res.status(400).json({ error: 'Missing origin or destination' });

    const route = getRouteProfile(origin, destination);
    const dest  = getDestinationProfile(destination);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.status(200).json({ route, dest });
};

export const getBudgetEstimate = async (req: Request, res: Response) => {
    try {
        const { planId, budget, travelers } = req.query as Record<string, string>;
        if (!planId) return res.status(400).json({ error: 'Missing planId' });
        if (!budget)  return res.status(400).json({ error: 'Missing budget' });
        if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });

        const plan = getPlan(planId);
        if (!plan) return res.status(404).json({ error: 'Plan not found or expired' });

        const result = await estimateBudget({
            destination:  plan.destination,
            origin:       plan.origin || '',
            tripDays:     plan.days?.length ?? 1,
            travelers:    travelers || '2 adults',
            transportMode: plan.transportMode || 'cab',
            userBudget:   Number(budget),
            aiTotalCost:  plan.totalEstimatedCost ?? 0,
        });

        res.set('Cache-Control', 'private, max-age=300');
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getPlanById = async (req: Request, res: Response) => {
    try {
        const { planId } = req.params;
        if (!planId) return res.status(400).json({ error: "Missing planId parameter" });

        const plan = getPlan(planId);
        if (!plan) return res.status(404).json({ error: "Plan not found or expired" });

        return res.status(200).json(plan);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const translate = async (req: Request, res: Response) => {
    try {
        const { text, destination } = req.body;
        if (!text?.trim()) return res.status(400).json({ error: 'Missing text' });
        if (!destination?.trim()) return res.status(400).json({ error: 'Missing destination' });
        const result = await translatePhrase(text.trim(), destination.trim());
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
