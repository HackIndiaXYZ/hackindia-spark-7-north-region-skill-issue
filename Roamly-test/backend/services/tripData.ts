// Real-world Indian travel data (2024-2025)
// Injected into AI prompts so the model uses accurate prices, not hallucinated ones.

export interface DestinationProfile {
    hotelBudget: number;       // per night – budget guesthouse
    hotelMid: number;          // per night – 3-star
    hotelLuxury: number;       // per night – 4-5 star
    mealStreet: number;        // per person – street / dhaba
    mealRestaurant: number;    // per person – sit-down
    localTransportPerDay: number;
    attractions: { name: string; fee: number }[];
    notes: string;
}

export interface RouteProfile {
    distanceKm: number;
    // per-person costs
    busMin: number;      // state / ordinary bus
    busMax: number;      // AC Volvo / sleeper
    // full-cab costs (not per person)
    cabMin: number;      // sedan / hatchback
    cabMax: number;      // Innova / SUV
    // per-person flight cost (economy, one-way)
    flightMin: number;   // 0 if no direct flight feasible
    flightMax: number;
    driveTimeH: number;
    busTimeH: number;
    flightTimeH: number;
}

// ── Destination Profiles ─────────────────────────────────────────────────────

export const DESTINATIONS: Record<string, DestinationProfile> = {
    goa: {
        hotelBudget: 700, hotelMid: 2500, hotelLuxury: 8000,
        mealStreet: 120, mealRestaurant: 500, localTransportPerDay: 400,
        attractions: [
            { name: 'Dudhsagar Falls jeep tour', fee: 600 },
            { name: 'Water sports (parasailing / jet-ski)', fee: 1500 },
            { name: 'Chapora Fort', fee: 0 }, { name: 'Basilica of Bom Jesus', fee: 0 },
            { name: 'Calangute / Baga Beach', fee: 0 },
        ],
        notes: 'Peak Nov–Feb: hotels 2-3× pricier. Scooter rental ₹300/day. North Goa = nightlife; South Goa = relaxed.',
    },
    jaipur: {
        hotelBudget: 600, hotelMid: 1800, hotelLuxury: 6000,
        mealStreet: 80, mealRestaurant: 350, localTransportPerDay: 250,
        attractions: [
            { name: 'Amer Fort', fee: 100 }, { name: 'Hawa Mahal', fee: 50 },
            { name: 'City Palace', fee: 200 }, { name: 'Nahargarh Fort', fee: 50 },
            { name: 'Jantar Mantar', fee: 50 }, { name: 'Jal Mahal viewpoint', fee: 0 },
        ],
        notes: 'Combo ticket Amer+Nahargarh+Jaigarh ≈₹500. Autos are primary local transport.',
    },
    agra: {
        hotelBudget: 500, hotelMid: 1500, hotelLuxury: 5000,
        mealStreet: 80, mealRestaurant: 300, localTransportPerDay: 200,
        attractions: [
            { name: 'Taj Mahal (Indian national)', fee: 250 },
            { name: 'Agra Fort (Indian)', fee: 50 },
            { name: 'Fatehpur Sikri', fee: 40 },
            { name: 'Mehtab Bagh sunset view', fee: 30 },
        ],
        notes: 'Taj Mahal: ₹250 for Indians. Book sunrise slot online. 1-day itinerary is common.',
    },
    manali: {
        hotelBudget: 600, hotelMid: 2000, hotelLuxury: 6000,
        mealStreet: 100, mealRestaurant: 350, localTransportPerDay: 300,
        attractions: [
            { name: 'Rohtang Pass NGT permit', fee: 550 },
            { name: 'Solang Valley activities', fee: 400 },
            { name: 'Hadimba Temple', fee: 0 },
            { name: 'Beas River rafting', fee: 600 },
            { name: 'Paragliding (Solang)', fee: 2500 },
        ],
        notes: 'Book Rohtang permit online 2 days ahead. Closed Oct–May. Peak Jun–Aug.',
    },
    shimla: {
        hotelBudget: 700, hotelMid: 2000, hotelLuxury: 5000,
        mealStreet: 80, mealRestaurant: 300, localTransportPerDay: 200,
        attractions: [
            { name: 'Kufri Fun World', fee: 400 }, { name: 'Jakhu Temple cable car', fee: 500 },
            { name: 'Mall Road stroll', fee: 0 }, { name: 'Toy train (joy ride)', fee: 400 },
        ],
        notes: 'Mall Road: no vehicles 8am–8pm. Snow Dec–Feb. Ridge and Mall walkable.',
    },
    udaipur: {
        hotelBudget: 700, hotelMid: 2200, hotelLuxury: 8000,
        mealStreet: 100, mealRestaurant: 400, localTransportPerDay: 250,
        attractions: [
            { name: 'City Palace', fee: 300 }, { name: 'Pichola Lake boat', fee: 400 },
            { name: 'Fateh Sagar Lake boat', fee: 150 }, { name: 'Sajjangarh (Monsoon Palace)', fee: 80 },
            { name: 'Saheliyon ki Bari', fee: 30 },
        ],
        notes: 'Rooftop restaurants with lake views are a highlight. Best Oct–Mar.',
    },
    varanasi: {
        hotelBudget: 450, hotelMid: 1500, hotelLuxury: 4000,
        mealStreet: 60, mealRestaurant: 250, localTransportPerDay: 200,
        attractions: [
            { name: 'Ganga Aarti (Dashashwamedh Ghat)', fee: 0 },
            { name: 'Sunrise boat ride on Ganges', fee: 300 },
            { name: 'Sarnath', fee: 30 }, { name: 'Ramnagar Fort', fee: 30 },
        ],
        notes: 'Ghats best at dawn. Evening aarti is free — arrive 30 min early for front row.',
    },
    rishikesh: {
        hotelBudget: 400, hotelMid: 1500, hotelLuxury: 5000,
        mealStreet: 70, mealRestaurant: 280, localTransportPerDay: 200,
        attractions: [
            { name: 'River rafting 16 km', fee: 700 }, { name: 'River rafting 36 km', fee: 1200 },
            { name: 'Bungee jumping (83 m)', fee: 3550 }, { name: 'Beatles Ashram', fee: 150 },
            { name: 'Laxman Jhula / Ram Jhula', fee: 0 },
        ],
        notes: 'Alcohol-free town. Rafting best Mar–May and Sep–Nov. Book adventures in peak season.',
    },
    kerala: {
        hotelBudget: 700, hotelMid: 2500, hotelLuxury: 8000,
        mealStreet: 80, mealRestaurant: 350, localTransportPerDay: 250,
        attractions: [
            { name: 'Alleppey houseboat 1 night (incl. meals)', fee: 8000 },
            { name: 'Periyar Wildlife Sanctuary', fee: 300 },
            { name: 'Munnar tea garden tour', fee: 150 },
            { name: 'Athirapally Falls', fee: 30 },
            { name: 'Ayurveda full-body massage', fee: 1200 },
        ],
        notes: 'Houseboat ₹8,000–₹20,000/night for 2 pax. Monsoon Jun–Sep: lush but heavy rain.',
    },
    darjeeling: {
        hotelBudget: 600, hotelMid: 2000, hotelLuxury: 5000,
        mealStreet: 80, mealRestaurant: 300, localTransportPerDay: 250,
        attractions: [
            { name: 'Toy train joy ride (Darjeeling–Ghoom)', fee: 1340 },
            { name: 'Tiger Hill sunrise', fee: 100 }, { name: 'Batasia Loop', fee: 30 },
            { name: 'Tea garden tour', fee: 200 }, { name: 'Padmaja Naidu Zoo', fee: 60 },
        ],
        notes: 'Tiger Hill: depart 4am for sunrise. Book toy train 2+ days ahead. Best Sep–Nov, Mar–May.',
    },
    leh: {
        hotelBudget: 700, hotelMid: 2500, hotelLuxury: 7000,
        mealStreet: 100, mealRestaurant: 400, localTransportPerDay: 500,
        attractions: [
            { name: 'Pangong Lake jeep day tour', fee: 1800 },
            { name: 'Nubra Valley jeep day tour', fee: 2000 },
            { name: 'Inner Line Permit (Pangong/Nubra)', fee: 400 },
            { name: 'Hemis Monastery', fee: 50 }, { name: 'Leh Palace', fee: 30 },
        ],
        notes: 'Acclimatise 2 full days. Carry cash — many areas have no ATMs. Petrol is expensive.',
    },
    amritsar: {
        hotelBudget: 600, hotelMid: 1800, hotelLuxury: 5000,
        mealStreet: 80, mealRestaurant: 300, localTransportPerDay: 200,
        attractions: [
            { name: 'Golden Temple (Harmandir Sahib)', fee: 0 },
            { name: 'Wagah Border ceremony', fee: 0 },
            { name: 'Jallianwala Bagh', fee: 0 }, { name: 'Partition Museum', fee: 100 },
        ],
        notes: 'Free langar at Golden Temple 24/7. Wagah Border: arrive by 4pm. Head-cover required.',
    },
    jodhpur: {
        hotelBudget: 600, hotelMid: 1800, hotelLuxury: 6000,
        mealStreet: 80, mealRestaurant: 320, localTransportPerDay: 220,
        attractions: [
            { name: 'Mehrangarh Fort (Indian)', fee: 100 },
            { name: 'Jaswant Thada', fee: 30 }, { name: 'Umaid Bhawan Palace museum', fee: 100 },
        ],
        notes: 'Blue City — old city best on foot. Oct–Mar best season.',
    },
    jaisalmer: {
        hotelBudget: 500, hotelMid: 1800, hotelLuxury: 6000,
        mealStreet: 80, mealRestaurant: 300, localTransportPerDay: 250,
        attractions: [
            { name: 'Jaisalmer Fort', fee: 0 }, { name: 'Patwon ki Haveli', fee: 100 },
            { name: 'Sam Sand Dunes camel ride', fee: 400 },
            { name: 'Desert camping 1 night (incl. dinner + show)', fee: 1800 },
        ],
        notes: 'Desert camp includes camel + cultural show + dinner. Monsoon brings surprising greenery.',
    },
    mysore: {
        hotelBudget: 600, hotelMid: 1800, hotelLuxury: 5000,
        mealStreet: 70, mealRestaurant: 280, localTransportPerDay: 200,
        attractions: [
            { name: 'Mysore Palace (Indian)', fee: 100 },
            { name: 'Brindavan Gardens light show', fee: 60 },
            { name: 'Chamundeshwari Temple', fee: 0 }, { name: 'Mysore Zoo', fee: 100 },
        ],
        notes: 'Palace illuminated Sundays + holidays. Excellent silk and sandalwood shopping.',
    },
    ooty: {
        hotelBudget: 700, hotelMid: 2000, hotelLuxury: 5000,
        mealStreet: 80, mealRestaurant: 280, localTransportPerDay: 200,
        attractions: [
            { name: 'Nilgiri Mountain Railway (toy train)', fee: 105 },
            { name: 'Government Botanical Garden', fee: 50 },
            { name: 'Ooty Lake boating', fee: 80 }, { name: 'Doddabetta Peak', fee: 10 },
        ],
        notes: 'Toy train from Mettupalayam: book 60 days ahead on IRCTC. Apr–Jun peak season.',
    },
    hampi: {
        hotelBudget: 400, hotelMid: 1500, hotelLuxury: 4000,
        mealStreet: 70, mealRestaurant: 250, localTransportPerDay: 200,
        attractions: [
            { name: 'Vittala Temple + Stone Chariot', fee: 600 },
            { name: 'Hampi ruins (ASI ticket)', fee: 40 },
            { name: 'Coracle ride on Tungabhadra', fee: 30 },
        ],
        notes: 'Rent bicycle ₹100/day or moped ₹200/day. Oct–Feb best weather.',
    },
    coorg: {
        hotelBudget: 900, hotelMid: 3000, hotelLuxury: 8000,
        mealStreet: 100, mealRestaurant: 350, localTransportPerDay: 300,
        attractions: [
            { name: 'Abbey Falls', fee: 50 }, { name: 'Namdroling Monastery', fee: 0 },
            { name: 'Coffee plantation tour', fee: 300 }, { name: 'Barapole rafting', fee: 1200 },
        ],
        notes: 'No railway station — nearest Mysore (120 km). Monsoon Jun–Sep: heavy rain but lush.',
    },
    pondicherry: {
        hotelBudget: 800, hotelMid: 2500, hotelLuxury: 7000,
        mealStreet: 100, mealRestaurant: 400, localTransportPerDay: 250,
        attractions: [
            { name: 'Auroville Matrimandir', fee: 0 }, { name: 'Paradise Beach (ferry)', fee: 200 },
            { name: 'Sri Aurobindo Ashram', fee: 0 }, { name: 'French Quarter cycle tour', fee: 0 },
        ],
        notes: 'Matrimandir needs advance booking. Bicycle rental ₹100/day. Good French cuisine.',
    },
    kolkata: {
        hotelBudget: 700, hotelMid: 2000, hotelLuxury: 6000,
        mealStreet: 60, mealRestaurant: 300, localTransportPerDay: 200,
        attractions: [
            { name: 'Victoria Memorial (Indian)', fee: 30 }, { name: 'Indian Museum', fee: 30 },
            { name: 'Dakshineswar Kali Temple', fee: 0 }, { name: 'Sundarbans day tour', fee: 1500 },
        ],
        notes: 'Metro is cheap and efficient. Street food culture is exceptional. Durga Puja (Oct) is unmissable.',
    },
    hyderabad: {
        hotelBudget: 800, hotelMid: 2500, hotelLuxury: 7000,
        mealStreet: 80, mealRestaurant: 350, localTransportPerDay: 250,
        attractions: [
            { name: 'Charminar', fee: 25 }, { name: 'Golconda Fort', fee: 25 },
            { name: 'Salar Jung Museum', fee: 20 }, { name: 'Ramoji Film City (1 day)', fee: 1250 },
        ],
        notes: 'Biryani capital — try Paradise or Shah Ghouse. MMTS train useful within city.',
    },
    delhi: {
        hotelBudget: 700, hotelMid: 2500, hotelLuxury: 8000,
        mealStreet: 70, mealRestaurant: 400, localTransportPerDay: 300,
        attractions: [
            { name: 'Red Fort (Indian)', fee: 35 }, { name: 'Qutb Minar (Indian)', fee: 35 },
            { name: 'Humayun Tomb (Indian)', fee: 35 }, { name: 'India Gate', fee: 0 },
            { name: 'Lotus Temple', fee: 0 }, { name: 'Akshardham', fee: 0 },
        ],
        notes: 'Metro day pass ₹200. Avoid peak summer (May–Jun). Air quality poor Nov–Feb.',
    },
    mumbai: {
        hotelBudget: 1200, hotelMid: 3500, hotelLuxury: 10000,
        mealStreet: 80, mealRestaurant: 500, localTransportPerDay: 300,
        attractions: [
            { name: 'Gateway of India', fee: 0 },
            { name: 'Elephanta Caves ferry + entry', fee: 200 },
            { name: 'Dharavi slum tour', fee: 800 }, { name: 'Bollywood studio tour', fee: 1800 },
        ],
        notes: 'Most expensive Indian city. Vada pav ₹15–25 is iconic. Local trains are fastest.',
    },
    bangalore: {
        hotelBudget: 900, hotelMid: 2800, hotelLuxury: 8000,
        mealStreet: 80, mealRestaurant: 450, localTransportPerDay: 300,
        attractions: [
            { name: 'Lalbagh Botanical Garden', fee: 20 }, { name: 'Bangalore Palace', fee: 230 },
            { name: 'Nandi Hills (1 hr drive)', fee: 20 },
        ],
        notes: 'Heavy traffic — Namma Metro is best. Nandi Hills: go early morning.',
    },
    chennai: {
        hotelBudget: 800, hotelMid: 2500, hotelLuxury: 7000,
        mealStreet: 70, mealRestaurant: 350, localTransportPerDay: 250,
        attractions: [
            { name: 'Marina Beach', fee: 0 }, { name: 'Kapaleeshwarar Temple', fee: 0 },
            { name: 'Government Museum', fee: 30 }, { name: 'Mahabalipuram day trip', fee: 600 },
        ],
        notes: 'Marina Beach is India longest urban beach. Best Oct–Feb.',
    },
    andaman: {
        hotelBudget: 1000, hotelMid: 3500, hotelLuxury: 10000,
        mealStreet: 150, mealRestaurant: 500, localTransportPerDay: 400,
        attractions: [
            { name: 'Cellular Jail light & sound show', fee: 80 },
            { name: 'Snorkelling Havelock', fee: 800 },
            { name: 'Scuba diving (1 dive)', fee: 3500 },
            { name: 'Ferry Port Blair→Havelock', fee: 400 },
        ],
        notes: 'Government ferry ₹350–₹1200 (AC). Book ahead. No Schengen required for Indians.',
    },
};

// ── Route Profiles ────────────────────────────────────────────────────────────
// busMin/busMax: per person  |  cabMin/cabMax: full cab (not per person)
// flightMin/flightMax: per person economy (0 = no direct flight feasible for that distance)

export const ROUTES: Record<string, RouteProfile> = {
    'delhi-jaipur':        { distanceKm: 280,  busMin: 300,  busMax: 700,   cabMin: 4000,  cabMax: 6500,   flightMin: 0,    flightMax: 0,    driveTimeH: 5,    busTimeH: 5.5,  flightTimeH: 0 },
    'delhi-agra':          { distanceKm: 230,  busMin: 250,  busMax: 600,   cabMin: 3500,  cabMax: 5500,   flightMin: 0,    flightMax: 0,    driveTimeH: 4,    busTimeH: 4.5,  flightTimeH: 0 },
    'delhi-shimla':        { distanceKm: 370,  busMin: 450,  busMax: 950,   cabMin: 5000,  cabMax: 8000,   flightMin: 3500, flightMax: 6000, driveTimeH: 7,    busTimeH: 8,    flightTimeH: 1 },
    'delhi-manali':        { distanceKm: 550,  busMin: 650,  busMax: 1500,  cabMin: 8000,  cabMax: 13000,  flightMin: 4500, flightMax: 8000, driveTimeH: 11,   busTimeH: 14,   flightTimeH: 1.2 },
    'delhi-rishikesh':     { distanceKm: 250,  busMin: 250,  busMax: 600,   cabMin: 3500,  cabMax: 5500,   flightMin: 0,    flightMax: 0,    driveTimeH: 5,    busTimeH: 5.5,  flightTimeH: 0 },
    'delhi-amritsar':      { distanceKm: 450,  busMin: 500,  busMax: 1100,  cabMin: 6500,  cabMax: 10000,  flightMin: 3500, flightMax: 6500, driveTimeH: 8,    busTimeH: 9,    flightTimeH: 1.2 },
    'delhi-varanasi':      { distanceKm: 830,  busMin: 800,  busMax: 1900,  cabMin: 12000, cabMax: 18000,  flightMin: 4000, flightMax: 7000, driveTimeH: 14,   busTimeH: 16,   flightTimeH: 1.5 },
    'delhi-kolkata':       { distanceKm: 1470, busMin: 1200, busMax: 2800,  cabMin: 0,     cabMax: 0,      flightMin: 4000, flightMax: 8000, driveTimeH: 24,   busTimeH: 28,   flightTimeH: 2.2 },
    'delhi-mumbai':        { distanceKm: 1420, busMin: 1200, busMax: 2600,  cabMin: 0,     cabMax: 0,      flightMin: 4500, flightMax: 9000, driveTimeH: 23,   busTimeH: 26,   flightTimeH: 2.2 },
    'delhi-leh':           { distanceKm: 980,  busMin: 1100, busMax: 2300,  cabMin: 0,     cabMax: 22000,  flightMin: 6000, flightMax: 10000,driveTimeH: 20,   busTimeH: 28,   flightTimeH: 1.2 },
    'delhi-udaipur':       { distanceKm: 660,  busMin: 700,  busMax: 1600,  cabMin: 10000, cabMax: 15000,  flightMin: 3500, flightMax: 7000, driveTimeH: 11,   busTimeH: 13,   flightTimeH: 1.5 },
    'jaipur-udaipur':      { distanceKm: 395,  busMin: 400,  busMax: 900,   cabMin: 5500,  cabMax: 8500,   flightMin: 0,    flightMax: 0,    driveTimeH: 6.5,  busTimeH: 7.5,  flightTimeH: 0 },
    'jaipur-jodhpur':      { distanceKm: 340,  busMin: 350,  busMax: 800,   cabMin: 5000,  cabMax: 7500,   flightMin: 4500, flightMax: 7000, driveTimeH: 5.5,  busTimeH: 6.5,  flightTimeH: 1.2 },
    'jaipur-jaisalmer':    { distanceKm: 575,  busMin: 600,  busMax: 1300,  cabMin: 8500,  cabMax: 13000,  flightMin: 4500, flightMax: 7500, driveTimeH: 9,    busTimeH: 11,   flightTimeH: 1.2 },
    'jaipur-agra':         { distanceKm: 235,  busMin: 250,  busMax: 550,   cabMin: 3500,  cabMax: 5500,   flightMin: 0,    flightMax: 0,    driveTimeH: 4,    busTimeH: 5,    flightTimeH: 0 },
    'mumbai-goa':          { distanceKm: 590,  busMin: 650,  busMax: 1500,  cabMin: 9000,  cabMax: 14000,  flightMin: 4000, flightMax: 8000, driveTimeH: 10,   busTimeH: 12,   flightTimeH: 1.2 },
    'mumbai-pune':         { distanceKm: 155,  busMin: 180,  busMax: 400,   cabMin: 2500,  cabMax: 4000,   flightMin: 0,    flightMax: 0,    driveTimeH: 3,    busTimeH: 4,    flightTimeH: 0 },
    'mumbai-hyderabad':    { distanceKm: 715,  busMin: 750,  busMax: 1700,  cabMin: 11000, cabMax: 17000,  flightMin: 4000, flightMax: 8000, driveTimeH: 12,   busTimeH: 14,   flightTimeH: 1.5 },
    'mumbai-bangalore':    { distanceKm: 985,  busMin: 900,  busMax: 2100,  cabMin: 0,     cabMax: 0,      flightMin: 4000, flightMax: 8000, driveTimeH: 16,   busTimeH: 18,   flightTimeH: 1.5 },
    'bangalore-mysore':    { distanceKm: 150,  busMin: 150,  busMax: 350,   cabMin: 2200,  cabMax: 3500,   flightMin: 0,    flightMax: 0,    driveTimeH: 3,    busTimeH: 3.5,  flightTimeH: 0 },
    'bangalore-ooty':      { distanceKm: 270,  busMin: 280,  busMax: 650,   cabMin: 4000,  cabMax: 6500,   flightMin: 0,    flightMax: 0,    driveTimeH: 5,    busTimeH: 6,    flightTimeH: 0 },
    'bangalore-coorg':     { distanceKm: 265,  busMin: 270,  busMax: 620,   cabMin: 4000,  cabMax: 6500,   flightMin: 0,    flightMax: 0,    driveTimeH: 5,    busTimeH: 6,    flightTimeH: 0 },
    'bangalore-goa':       { distanceKm: 560,  busMin: 600,  busMax: 1400,  cabMin: 8500,  cabMax: 13500,  flightMin: 3500, flightMax: 7000, driveTimeH: 9.5,  busTimeH: 11.5, flightTimeH: 1.2 },
    'bangalore-hampi':     { distanceKm: 355,  busMin: 370,  busMax: 840,   cabMin: 5500,  cabMax: 8500,   flightMin: 0,    flightMax: 0,    driveTimeH: 6,    busTimeH: 7.5,  flightTimeH: 0 },
    'bangalore-chennai':   { distanceKm: 345,  busMin: 350,  busMax: 800,   cabMin: 5000,  cabMax: 8000,   flightMin: 3500, flightMax: 6500, driveTimeH: 6,    busTimeH: 7,    flightTimeH: 1 },
    'chennai-pondicherry': { distanceKm: 155,  busMin: 160,  busMax: 380,   cabMin: 2500,  cabMax: 4000,   flightMin: 0,    flightMax: 0,    driveTimeH: 3,    busTimeH: 4,    flightTimeH: 0 },
    'hyderabad-hampi':     { distanceKm: 380,  busMin: 400,  busMax: 880,   cabMin: 5800,  cabMax: 9000,   flightMin: 0,    flightMax: 0,    driveTimeH: 6.5,  busTimeH: 8,    flightTimeH: 0 },
    'kolkata-darjeeling':  { distanceKm: 640,  busMin: 700,  busMax: 1500,  cabMin: 10000, cabMax: 16000,  flightMin: 4500, flightMax: 8000, driveTimeH: 11,   busTimeH: 13,   flightTimeH: 1.2 },
    'kolkata-varanasi':    { distanceKm: 680,  busMin: 700,  busMax: 1600,  cabMin: 11000, cabMax: 17000,  flightMin: 4000, flightMax: 7500, driveTimeH: 12,   busTimeH: 14,   flightTimeH: 1.5 },
    'baddi-jaipur':        { distanceKm: 580,  busMin: 650,  busMax: 1500,  cabMin: 9000,  cabMax: 14000,  flightMin: 5000, flightMax: 9000, driveTimeH: 10,   busTimeH: 13,   flightTimeH: 3 },
    'baddi-delhi':         { distanceKm: 280,  busMin: 300,  busMax: 700,   cabMin: 4500,  cabMax: 7000,   flightMin: 0,    flightMax: 0,    driveTimeH: 5.5,  busTimeH: 7,    flightTimeH: 0 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const norm = (s: string) =>
    s.toLowerCase().replace(/\s+(city|town|district|state|island)\b/g, '').replace(/\s+/g, ' ').trim();

export const getDestinationProfile = (destination: string): DestinationProfile | null => {
    const key = norm(destination);
    if (DESTINATIONS[key]) return DESTINATIONS[key];
    for (const [k, v] of Object.entries(DESTINATIONS)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return null;
};

const routeKey = (a: string, b: string) =>
    `${norm(a).replace(/\s/g, '-')}-${norm(b).replace(/\s/g, '-')}`;

export const getRouteProfile = (origin: string, destination: string): RouteProfile | null => {
    const k1 = routeKey(origin, destination);
    const k2 = routeKey(destination, origin);
    return ROUTES[k1] || ROUTES[k2] || null;
};

const fmt = (n: number) => n.toLocaleString('en-IN');

// Builds a plain-text context block injected into AI prompts
export const buildTripContext = (
    origin: string,
    destination: string,
    transportMode: string,
    travelers: string,
    budget: number | string
): string => {
    const dest  = getDestinationProfile(destination);
    const route = getRouteProfile(origin, destination);
    const lines: string[] = ['REAL-WORLD INDIA TRAVEL DATA (2024-2025) — use these exact figures, do not invent prices:'];

    if (dest) {
        lines.push(`\nDESTINATION: ${destination}`);
        lines.push(`  Hotel/night: Budget ₹${fmt(dest.hotelBudget)}–₹${fmt(dest.hotelMid)} | Mid ₹${fmt(dest.hotelMid)}–₹${fmt(dest.hotelLuxury)}`);
        lines.push(`  Meals/person: Street ₹${dest.mealStreet}–₹${Math.round(dest.mealStreet * 1.5)} | Restaurant ₹${dest.mealRestaurant}–₹${Math.round(dest.mealRestaurant * 1.6)}`);
        lines.push(`  Local transport/day: ₹${dest.localTransportPerDay}–₹${dest.localTransportPerDay + 150}`);
        lines.push(`  Entry fees (Indian nationals):`);
        dest.attractions.forEach(a => lines.push(`    • ${a.name}: ${a.fee === 0 ? 'Free' : `₹${fmt(a.fee)}`}`));
        lines.push(`  Note: ${dest.notes}`);
    }

    if (route) {
        lines.push(`\nROUTE: ${origin} → ${destination} (~${route.distanceKm} km)`);
        lines.push(`  Bus: ₹${fmt(route.busMin)}–₹${fmt(route.busMax)} per person`);
        if (route.cabMin > 0)
            lines.push(`  Cab (full vehicle): ₹${fmt(route.cabMin)}–₹${fmt(route.cabMax)}`);
        if (route.flightMin > 0)
            lines.push(`  Flight (economy one-way): ₹${fmt(route.flightMin)}–₹${fmt(route.flightMax)} per person`);
        lines.push(`  Travel time: Drive ~${route.driveTimeH}h | Bus ~${route.busTimeH}h${route.flightTimeH > 0 ? ` | Flight ~${route.flightTimeH}h` : ''}`);
    } else {
        lines.push(`\nGENERIC TRANSPORT RATES (route not in table — estimate from these):`);
        lines.push(`  Cab: ₹12–₹16/km (sedan) | ₹16–₹20/km (SUV/Innova)`);
        lines.push(`  Bus: ₹1.2–₹1.8/km (state) | ₹2.5–₹4/km (AC Volvo sleeper)`);
        lines.push(`  Flight: ₹3,500–₹6,000 short haul | ₹5,000–₹10,000 long haul per person`);
    }

    lines.push(`\nBUDGET: User's total group budget = ₹${fmt(Number(budget))}. totalEstimatedCost must not exceed this.`);
    lines.push(`TRAVELERS: ${travelers}`);
    return lines.join('\n');
};
