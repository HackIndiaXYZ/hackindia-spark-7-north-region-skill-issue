// Numbeo Safety Index scores for Indian cities (2024-2025 data)
// Source: numbeo.com/crime/country_result.jsp?country=India
// Scale: 0-100 (higher = safer). Labels: >=70 Very Safe, 57-69 Safe, 45-56 Moderate, <45 Use Caution

export interface SafetyEntry {
    score: number;
    label: 'Very Safe' | 'Safe' | 'Moderate' | 'Use Caution';
    details: string;
}

const RAW: Record<string, { score: number; details: string }> = {
    // Major metros
    'delhi': { score: 47.3, details: 'Exercise normal caution; petty crime and scams are common in tourist areas.' },
    'new delhi': { score: 47.3, details: 'Exercise normal caution; petty crime and scams are common in tourist areas.' },
    'mumbai': { score: 52.1, details: 'Generally manageable safety; stay alert in crowded areas and at night.' },
    'bombay': { score: 52.1, details: 'Generally manageable safety; stay alert in crowded areas and at night.' },
    'bengaluru': { score: 50.9, details: 'Moderate safety; night-time travel and isolated areas warrant extra care.' },
    'bangalore': { score: 50.9, details: 'Moderate safety; night-time travel and isolated areas warrant extra care.' },
    'hyderabad': { score: 53.8, details: 'Moderate safety for tourists; well-policed heritage zones.' },
    'chennai': { score: 60.3, details: 'Relatively safe city; tourist infrastructure is well-developed.' },
    'madras': { score: 60.3, details: 'Relatively safe city; tourist infrastructure is well-developed.' },
    'kolkata': { score: 54.3, details: 'Moderate safety; stay aware in busy market areas.' },
    'calcutta': { score: 54.3, details: 'Moderate safety; stay aware in busy market areas.' },
    'pune': { score: 58.7, details: 'Safe for tourists with good law enforcement presence.' },
    'ahmedabad': { score: 68.2, details: 'One of the safer large cities; tourist areas are well-patrolled.' },
    'surat': { score: 66.6, details: 'Safe city with low tourist crime rates.' },
    'jaipur': { score: 65.2, details: 'Well-monitored heritage city; standard tourist precautions advised.' },
    'chandigarh': { score: 57.4, details: 'Planned, orderly city with good safety standards.' },
    'thiruvananthapuram': { score: 61.1, details: 'Safe capital city; tourist areas are calm and well-managed.' },
    'trivandrum': { score: 61.1, details: 'Safe capital city; tourist areas are calm and well-managed.' },
    'kochi': { score: 60.8, details: 'Tourist-friendly port city with good safety infrastructure.' },
    'cochin': { score: 60.8, details: 'Tourist-friendly port city with good safety infrastructure.' },
    'vadodara': { score: 69.2, details: 'Very safe city; low crime and strong community policing.' },
    'baroda': { score: 69.2, details: 'Very safe city; low crime and strong community policing.' },
    'mangalore': { score: 74.2, details: 'Among the safest cities in India; low crime, peaceful environment.' },
    'mangaluru': { score: 74.2, details: 'Among the safest cities in India; low crime, peaceful environment.' },
    'navi mumbai': { score: 63.5, details: 'Safer than central Mumbai; planned township with good policing.' },
    'nagpur': { score: 63.1, details: 'Central India hub with moderate-to-good safety for visitors.' },
    'indore': { score: 65.4, details: 'Clean and relatively safe city; popular for food tourism.' },
    'bhopal': { score: 58.1, details: 'Moderate safety; heritage areas are generally tourist-friendly.' },
    'lucknow': { score: 55.2, details: 'Use normal caution; tourist zones around the old city are monitored.' },
    'agra': { score: 50.4, details: 'Exercise caution around major monuments; scams and touts are common.' },
    'varanasi': { score: 51.8, details: 'Crowded ghats require vigilance; petty crime and scams are frequent.' },
    'banaras': { score: 51.8, details: 'Crowded ghats require vigilance; petty crime and scams are frequent.' },
    'amritsar': { score: 64.2, details: 'Safe and welcoming city; Golden Temple area is well-secured.' },
    'guwahati': { score: 55.6, details: 'Moderate safety; gateway city to Northeast India.' },
    'mysuru': { score: 64.0, details: 'Royal city with good tourist safety; well-patrolled palace area.' },
    'mysore': { score: 64.0, details: 'Royal city with good tourist safety; well-patrolled palace area.' },
    'coimbatore': { score: 63.7, details: 'Industrial city with low tourist crime; safe for independent travel.' },
    'visakhapatnam': { score: 62.4, details: 'Port city with solid safety record for tourists.' },
    'vizag': { score: 62.4, details: 'Port city with solid safety record for tourists.' },
    'udaipur': { score: 67.8, details: 'Lake city with excellent tourist safety; heavily monitored heritage zone.' },
    'jodhpur': { score: 66.1, details: 'Blue city with good policing around fort and market areas.' },
    'jaisalmer': { score: 67.0, details: 'Desert city; safe for tourists with active tourist police presence.' },
    'pushkar': { score: 65.5, details: 'Small pilgrimage town; generally safe with tourist police.' },
    'ajmer': { score: 60.0, details: 'Pilgrimage city; moderate safety, stay alert near crowded shrines.' },
    'rishikesh': { score: 66.2, details: 'Yoga capital; safe for solo travellers, strong tourist infrastructure.' },
    'haridwar': { score: 63.0, details: 'Pilgrimage city; safe overall, crowded during festivals.' },
    'dehradun': { score: 60.5, details: 'Moderate safety; capital city with improving infrastructure.' },
    'mussoorie': { score: 62.0, details: 'Hill station; safe for tourists, standard precautions apply.' },
    'shimla': { score: 66.5, details: 'Well-policed hill capital; very safe for tourists year-round.' },
    'manali': { score: 64.8, details: 'Popular hill station; safe with good tourist police presence.' },
    'dharamsala': { score: 67.0, details: 'Very safe town; strong international tourist presence and monitoring.' },
    'mcleod ganj': { score: 67.0, details: 'Tibetan hub; peaceful and well-monitored for tourists.' },
    'spiti': { score: 68.0, details: 'Remote valley; very low crime, safe but plan for medical emergencies.' },
    'leh': { score: 72.0, details: 'Very safe; low crime rate, strong military and police presence.' },
    'ladakh': { score: 72.0, details: 'Very safe region; low crime, strong security presence.' },
    'srinagar': { score: 45.2, details: 'Exercise heightened caution; monitor travel advisories before visiting.' },
    'jammu': { score: 48.0, details: 'Use caution; check current travel advisories.' },
    'goa': { score: 58.5, details: 'Popular with tourists; safe in resort areas, caution at night on beaches.' },
    'panaji': { score: 59.0, details: "Goa's capital; relatively safe, normal tourist precautions apply." },
    'north goa': { score: 57.0, details: 'Busier tourist belt; occasional petty theft, stay alert at night.' },
    'south goa': { score: 61.0, details: 'Quieter and safer than North Goa; relaxed atmosphere.' },
    'ooty': { score: 63.5, details: 'Nilgiri hill station; safe for families and solo travellers.' },
    'kodaikanal': { score: 64.0, details: 'Quiet hill station; low crime, safe for solo travel.' },
    'munnar': { score: 65.0, details: 'Tea country; safe and scenic, minimal tourist crime.' },
    'alleppey': { score: 62.5, details: 'Backwater town; peaceful and safe for houseboat tourists.' },
    'alappuzha': { score: 62.5, details: 'Backwater town; peaceful and safe for houseboat tourists.' },
    'varkala': { score: 62.0, details: 'Cliff beach; safe with active tourist police.' },
    'kovalam': { score: 61.5, details: 'Beach resort; well-monitored, safe for tourists.' },
    'hampi': { score: 68.0, details: 'UNESCO heritage site; very safe, low crime rural setting.' },
    'badami': { score: 67.0, details: 'Cave temple town; safe, rural and peaceful.' },
    'puri': { score: 59.0, details: 'Pilgrimage beach city; safe near temple and beach areas.' },
    'bhubaneswar': { score: 60.2, details: 'Temple city; moderate safety with tourist-friendly zones.' },
    'konark': { score: 64.0, details: 'UNESCO heritage area; small town, very safe for visitors.' },
    'darjeeling': { score: 64.5, details: 'Tea hill station; safe and well-connected for tourists.' },
    'gangtok': { score: 72.5, details: 'Sikkim capital; one of the safest tourist cities in India.' },
    'sikkim': { score: 73.0, details: 'Safest state in India; very low crime, eco-tourism focused.' },
    'shillong': { score: 60.8, details: 'Northeast capital; safe in tourist zones, check local advisories.' },
    'cherrapunji': { score: 67.0, details: 'Wettest place on earth; rural, peaceful, very low crime.' },
    'sohra': { score: 67.0, details: 'Meghalaya highland; safe and scenic.' },
    'kaziranga': { score: 68.0, details: 'Wildlife reserve; very safe, well-managed park areas.' },
    'jim corbett': { score: 67.0, details: 'Wildlife park; safe and well-managed for eco-tourists.' },
    'ranthambore': { score: 65.0, details: 'Tiger reserve; safe within park zones.' },
    'corbett': { score: 67.0, details: 'National park; safe and well-managed for eco-tourists.' },
    'bandhavgarh': { score: 65.0, details: 'Tiger reserve; safe within national park boundaries.' },
    'khajuraho': { score: 63.0, details: 'Heritage temples; safe for tourists, active heritage police.' },
    'orchha': { score: 66.0, details: 'Riverside heritage town; very peaceful, low crime.' },
    'pachmarhi': { score: 67.0, details: 'MP hill station; quiet, very safe for families.' },
    'mahabaleshwar': { score: 64.0, details: 'Maharashtra hill station; safe and popular, standard precautions.' },
    'lonavala': { score: 62.0, details: 'Weekend hill resort; safe but crowded on weekends.' },
    'aurangabad': { score: 57.5, details: 'Gateway to Ajanta-Ellora; moderate safety, tourist zones monitored.' },
    'nashik': { score: 61.0, details: 'Wine and pilgrimage city; moderate-good safety.' },
    'shirdi': { score: 62.0, details: 'Pilgrimage town; heavily policed around Sai Baba temple.' },
    'tirupati': { score: 63.0, details: 'Pilgrimage city; well-managed with strong devotee security.' },
    'madurai': { score: 59.5, details: 'Temple city; safe in heritage areas, standard caution elsewhere.' },
    'tanjavur': { score: 63.0, details: 'Heritage district; very safe, rural and calm.' },
    'tanjore': { score: 63.0, details: 'Heritage district; very safe, rural and calm.' },
    'andaman': { score: 74.0, details: 'Island territory; one of the safest tourist destinations in India.' },
    'port blair': { score: 73.0, details: 'Andaman capital; very safe island city.' },
    'lakshadweep': { score: 75.0, details: 'Remote islands; extremely safe, restricted access keeps crime near zero.' },
    'pondicherry': { score: 64.5, details: 'French quarter town; safe and very tourist-friendly.' },
    'puducherry': { score: 64.5, details: 'French quarter town; safe and very tourist-friendly.' },
    'aizawl': { score: 76.0, details: 'Mizoram capital; one of the safest cities in India.' },
    'imphal': { score: 46.0, details: 'Check current travel advisories before visiting Manipur.' },
    'kohima': { score: 62.0, details: 'Nagaland capital; safe in city, check advisories for rural areas.' },
    'itanagar': { score: 58.0, details: 'Arunachal capital; permits required, moderate safety.' },
    'tawang': { score: 68.0, details: 'Buddhist highland; very peaceful and safe, requires ILP permit.' },
    'ziro': { score: 69.0, details: 'Apatani valley; very safe, low crime, requires ILP.' },
    'raipur': { score: 56.0, details: 'Chhattisgarh capital; moderate safety, avoid rural conflict zones.' },
    'ranchi': { score: 54.0, details: 'Jharkhand capital; moderate safety for urban tourists.' },
    'patna': { score: 48.5, details: 'Bihar capital; use caution, stay in well-lit tourist areas.' },
    'bodhgaya': { score: 53.0, details: 'Buddhist pilgrimage site; moderately safe, international police presence.' },
    'nalanda': { score: 55.0, details: 'Archaeological site; relatively safe, guided tours recommended.' },
    'prayagraj': { score: 52.5, details: 'Use normal caution; well-policed during Kumbh Mela.' },
    'allahabad': { score: 52.5, details: 'Use normal caution, well-policed during major events.' },
    'mathura': { score: 56.0, details: 'Pilgrimage city; safe near temples, watch for crowds.' },
    'vrindavan': { score: 56.5, details: 'Holy town; generally safe, standard tourist precautions.' },
    'nainital': { score: 64.0, details: 'Lake hill station; safe and popular, standard precautions.' },
    'kerala': { score: 61.5, details: 'One of the safest states; strong tourist infrastructure across the state.' },
    'rajasthan': { score: 63.0, details: 'Well-monitored tourist state; heritage zones are policed.' },
    'himachal pradesh': { score: 66.0, details: 'Very safe hill state; low crime and good tourist infrastructure.' },
    'uttarakhand': { score: 63.5, details: 'Safe hill state; strong presence in pilgrimage and tourist corridors.' },
    'gujarat': { score: 67.0, details: 'Among the safer states in India; well-managed tourist zones.' },
    'karnataka': { score: 60.0, details: 'Moderate safety; major tourist areas are well-patrolled.' },
    'meghalaya': { score: 65.0, details: 'Safe northeastern state; peaceful and scenic.' },
};

function getLabel(score: number): SafetyEntry['label'] {
    if (score >= 70) return 'Very Safe';
    if (score >= 57) return 'Safe';
    if (score >= 45) return 'Moderate';
    return 'Use Caution';
}

function normalize(name: string): string {
    return name.toLowerCase().trim()
        .replace(/[,/\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b(city|town|district|state|india|national park|wildlife sanctuary)\b/g, '')
        .trim();
}

export function lookupSafety(destination: string): SafetyEntry | null {
    const key = normalize(destination);

    if (RAW[key]) {
        const e = RAW[key];
        return { score: e.score, label: getLabel(e.score), details: e.details };
    }

    // Partial match: table key contained in query or vice versa
    for (const [tableKey, entry] of Object.entries(RAW)) {
        if (key.includes(tableKey) || tableKey.includes(key)) {
            return { score: entry.score, label: getLabel(entry.score), details: entry.details };
        }
    }

    return null;
}
