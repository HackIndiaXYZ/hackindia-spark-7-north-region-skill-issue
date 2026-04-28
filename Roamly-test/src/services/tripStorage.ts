export interface SavedTrip {
    planId: string;
    destination: string;
    origin: string;
    startDate: string;
    endDate: string;
    travelers: string;
    budget: string;
    totalEstimatedCost: number;
    vibe: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdAt: string;
}

const STORAGE_KEY = 'roamly_trips';

export const getTrips = (): SavedTrip[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const saveTrip = (trip: SavedTrip): void => {
    const trips = getTrips();
    const existing = trips.findIndex(t => t.planId === trip.planId);
    if (existing !== -1) {
        trips[existing] = trip;
    } else {
        trips.unshift(trip);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const updateTripStatus = (planId: string, status: SavedTrip['status']): void => {
    const trips = getTrips();
    const idx = trips.findIndex(t => t.planId === planId);
    if (idx !== -1) {
        trips[idx].status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    }
};

export const deleteTrip = (planId: string): void => {
    const trips = getTrips().filter(t => t.planId !== planId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const getTripCount = (): number => getTrips().length;

// Compute what status a trip should have based purely on today's date.
// Cancelled trips are never touched by this function.
export const computeStatus = (trip: SavedTrip): SavedTrip['status'] => {
    if (trip.status === 'cancelled') return 'cancelled';
    if (!trip.startDate || !trip.endDate) return trip.status;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    end.setHours(23, 59, 59, 999);
    if (today > end) return 'completed';
    if (today >= start) return 'ongoing';
    return 'upcoming';
};

// Re-evaluate and persist status for every non-cancelled trip based on today's date.
export const refreshTripStatuses = (): void => {
    const trips = getTrips();
    let changed = false;
    trips.forEach(trip => {
        if (trip.status === 'cancelled') return;
        const computed = computeStatus(trip);
        if (trip.status !== computed) {
            trip.status = computed;
            changed = true;
        }
    });
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

// Store / retrieve the full AI-generated plan JSON per planId
export const savePlanData = (planId: string, plan: unknown): void => {
    try {
        localStorage.setItem(`roamly_plan_${planId}`, JSON.stringify(plan));
    } catch { /* quota exceeded — ignore */ }
};

export const getPlanData = (planId: string): unknown | null => {
    try {
        const raw = localStorage.getItem(`roamly_plan_${planId}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// Persist the set of checked activity IDs for a plan's checklist
export const saveChecklist = (planId: string, checked: string[]): void => {
    try {
        localStorage.setItem(`roamly_checklist_${planId}`, JSON.stringify(checked));
    } catch { /* ignore */ }
};

export const getChecklist = (planId: string): string[] => {
    try {
        const raw = localStorage.getItem(`roamly_checklist_${planId}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};
