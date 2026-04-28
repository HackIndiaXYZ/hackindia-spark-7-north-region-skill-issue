import { Router } from 'express';
import { generateItinerary, replanEvent, generateSurprise, generateNearMe, getPlanById, getSafetyScore, getLocalPhrases, getBudgetEstimate, getRouteCosts, translate } from '../controllers/itinerary.controller';

const router = Router();

router.post('/generate-itinerary', generateItinerary);
router.post('/replan-event', replanEvent);
router.get('/surprise', generateSurprise);
router.post('/near-me', generateNearMe);
router.get('/plan/:planId', getPlanById);
router.get('/safety', getSafetyScore);
router.get('/phrases', getLocalPhrases);
router.get('/budget-estimate', getBudgetEstimate);
router.get('/route-costs', getRouteCosts);
router.post('/translate', translate);

export default router;
