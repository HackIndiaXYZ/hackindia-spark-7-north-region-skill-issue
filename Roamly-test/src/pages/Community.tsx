import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveTrip } from '../services/tripStorage';

const trips = [
    { title: 'Jaipur 3‑day Cultural', creator: 'TravelerAnjali', rating: 4.8, ratings: 120, vibe: 'cultural', destination: 'Jaipur', duration: '3 days', budget: '₹12,000', tags: ['Heritage', 'Food'] },
    { title: 'Goa Budget Backpacking', creator: 'VikramS', rating: 4.9, ratings: 98, vibe: 'beach', destination: 'Goa', duration: '4 days', budget: '₹8,500', tags: ['Beaches', 'Hostels'] },
    { title: 'Manali Adventure Week', creator: 'MountainMike', rating: 4.7, ratings: 76, vibe: 'adventure', destination: 'Manali', duration: '7 days', budget: '₹15,000', tags: ['Trekking', 'Snow'] },
    { title: 'Kerala Backwaters & Ayurveda', creator: 'SereneSoul', rating: 4.9, ratings: 210, vibe: 'cultural', destination: 'Kerala', duration: '5 days', budget: '₹18,000', tags: ['Houseboat', 'Spa'] },
    { title: 'Rishikesh Yoga & Rafting', creator: 'YogiAdi', rating: 4.6, ratings: 55, vibe: 'adventure', destination: 'Rishikesh', duration: '4 days', budget: '₹9,000', tags: ['Yoga', 'Rafting'] },
    { title: 'Udaipur Romantic Escape', creator: 'LoveWander', rating: 4.9, ratings: 145, vibe: 'cultural', destination: 'Udaipur', duration: '3 days', budget: '₹14,000', tags: ['Lakes', 'Palaces'] },
    { title: 'Varanasi Spiritual Sojourn', creator: 'SacredSteps', rating: 4.7, ratings: 88, vibe: 'cultural', destination: 'Varanasi', duration: '3 days', budget: '₹8,000', tags: ['Ghats', 'Temples'] },
    { title: 'Jodhpur Blue City Tour', creator: 'RajRover', rating: 4.5, ratings: 62, vibe: 'cultural', destination: 'Jodhpur', duration: '3 days', budget: '₹10,000', tags: ['Forts', 'Bazaars'] },
    { title: 'Coorg Coffee & Hills', creator: 'BeanHunter', rating: 4.8, ratings: 91, vibe: 'adventure', destination: 'Coorg', duration: '3 days', budget: '₹11,000', tags: ['Coffee', 'Waterfalls'] },
    { title: 'Darjeeling Toy Train & Tea', creator: 'ChaiTrekker', rating: 4.8, ratings: 104, vibe: 'cultural', destination: 'Darjeeling', duration: '4 days', budget: '₹13,000', tags: ['Toy Train', 'Tea'] },
    { title: 'Hampi Bouldering & Ruins', creator: 'RockOn', rating: 4.6, ratings: 47, vibe: 'adventure', destination: 'Hampi', duration: '3 days', budget: '₹7,500', tags: ['Bouldering', 'UNESCO'] },
    { title: 'Amritsar Golden Temple & Food', creator: 'PunjabiFoodie', rating: 4.9, ratings: 132, vibe: 'cultural', destination: 'Amritsar', duration: '2 days', budget: '₹6,000', tags: ['Food', 'Temple'] },
    { title: 'Mysore Palace & Yoga', creator: 'RoyalYogi', rating: 4.7, ratings: 68, vibe: 'cultural', destination: 'Mysore', duration: '3 days', budget: '₹9,000', tags: ['Palace', 'Yoga'] },
    { title: 'Leh Ladakh Road Trip', creator: 'HighPassHunter', rating: 4.9, ratings: 185, vibe: 'adventure', destination: 'Leh', duration: '8 days', budget: '₹28,000', tags: ['Bike', 'High Passes'] },
    { title: 'Andaman Island Hopping', creator: 'BlueLagoon', rating: 4.8, ratings: 112, vibe: 'beach', destination: 'Andaman', duration: '6 days', budget: '₹25,000', tags: ['Scuba', 'Beaches'] },
    { title: 'Khajuraho Temple Trail', creator: 'HistoryBuff', rating: 4.5, ratings: 39, vibe: 'cultural', destination: 'Khajuraho', duration: '2 days', budget: '₹8,000', tags: ['Temples', 'UNESCO'] },
    { title: 'Shimla Colonial Charm', creator: 'MountainQueen', rating: 4.6, ratings: 72, vibe: 'cultural', destination: 'Shimla', duration: '3 days', budget: '₹10,000', tags: ['Toy Train', 'Mall Road'] },
    { title: 'Gokarna Beach Trek', creator: 'CoastalNomad', rating: 4.7, ratings: 58, vibe: 'beach', destination: 'Gokarna', duration: '3 days', budget: '₹6,500', tags: ['Beach Trek', 'Hippie'] },
    { title: 'Agra Taj Mahal & Fatehpur', creator: 'WonderWatcher', rating: 4.8, ratings: 200, vibe: 'cultural', destination: 'Agra', duration: '2 days', budget: '₹7,000', tags: ['Taj', 'Forts'] },
    { title: 'Pondicherry French Quarter', creator: 'FrenchConnect', rating: 4.8, ratings: 83, vibe: 'beach', destination: 'Pondicherry', duration: '3 days', budget: '₹9,000', tags: ['French', 'Beach'] },
    { title: 'Kutch White Desert Festival', creator: 'SaltSeeker', rating: 4.9, ratings: 67, vibe: 'cultural', destination: 'Kutch', duration: '4 days', budget: '₹14,000', tags: ['Festival', 'Desert'] },
    { title: 'Spiti Valley Cold Desert', creator: 'SpitiSoul', rating: 4.8, ratings: 94, vibe: 'adventure', destination: 'Spiti', duration: '7 days', budget: '₹22,000', tags: ['Monasteries', 'High Altitude'] },
    { title: 'Ooty Nilgiri Mountain Railway', creator: 'BlueMountains', rating: 4.7, ratings: 78, vibe: 'cultural', destination: 'Ooty', duration: '3 days', budget: '₹11,000', tags: ['Toy Train', 'Gardens'] },
    { title: 'Kodaikanal Lake & Forests', creator: 'ForestWalker', rating: 4.6, ratings: 44, vibe: 'adventure', destination: 'Kodaikanal', duration: '3 days', budget: '₹10,000', tags: ['Lake', 'Trekking'] },
    { title: 'Mahabaleshwar Strawberry Trail', creator: 'BerryBliss', rating: 4.5, ratings: 51, vibe: 'cultural', destination: 'Mahabaleshwar', duration: '2 days', budget: '₹8,000', tags: ['Strawberry', 'Viewpoints'] },
    { title: 'Lonavala Weekend Getaway', creator: 'WeekendVibe', rating: 4.6, ratings: 92, vibe: 'adventure', destination: 'Lonavala', duration: '2 days', budget: '₹6,000', tags: ['Caves', 'Waterfalls'] },
    { title: 'Mumbai Street Food & Bollywood', creator: 'BollywoodDreams', rating: 4.7, ratings: 115, vibe: 'cultural', destination: 'Mumbai', duration: '3 days', budget: '₹12,000', tags: ['Food', 'Bollywood'] },
    { title: 'Kolkata Cultural Capital', creator: 'BengalTiger', rating: 4.8, ratings: 86, vibe: 'cultural', destination: 'Kolkata', duration: '3 days', budget: '₹9,000', tags: ['Sweets', 'Colonial'] },
    { title: 'Hyderabad Biryani & History', creator: 'NawabiFlavor', rating: 4.8, ratings: 99, vibe: 'cultural', destination: 'Hyderabad', duration: '3 days', budget: '₹10,000', tags: ['Biryani', 'Charminar'] },
    { title: 'Jaisalmer Desert Safari', creator: 'GoldenSand', rating: 4.9, ratings: 143, vibe: 'adventure', destination: 'Jaisalmer', duration: '3 days', budget: '₹13,000', tags: ['Camel', 'Desert'] },
    { title: 'Pushkar Camel Fair', creator: 'NomadSpirit', rating: 4.7, ratings: 54, vibe: 'cultural', destination: 'Pushkar', duration: '3 days', budget: '₹9,000', tags: ['Camel Fair', 'Lake'] },
    { title: 'Bandhavgarh Tiger Safari', creator: 'WildAtHeart', rating: 4.8, ratings: 72, vibe: 'adventure', destination: 'Bandhavgarh', duration: '3 days', budget: '₹18,000', tags: ['Tiger', 'Safari'] },
    { title: 'Sikkim Monasteries & Peaks', creator: 'HimalayanSoul', rating: 4.9, ratings: 108, vibe: 'adventure', destination: 'Sikkim', duration: '5 days', budget: '₹18,000', tags: ['Monasteries', 'Mountains'] },
    { title: 'Meghalaya Living Root Bridges', creator: 'CloudWalker', rating: 4.8, ratings: 67, vibe: 'adventure', destination: 'Meghalaya', duration: '4 days', budget: '₹14,000', tags: ['Waterfalls', 'Bridges'] },
    { title: 'Nagaland Hornbill Festival', creator: 'TribalTrekker', rating: 4.9, ratings: 46, vibe: 'cultural', destination: 'Nagaland', duration: '4 days', budget: '₹18,000', tags: ['Festival', 'Tribal'] },
    { title: 'Orissa Konark & Puri', creator: 'SunTemple', rating: 4.6, ratings: 52, vibe: 'cultural', destination: 'Puri', duration: '3 days', budget: '₹9,000', tags: ['Temple', 'Beach'] },
    { title: 'Madurai Meenakshi Temple', creator: 'TempleTrail', rating: 4.8, ratings: 63, vibe: 'cultural', destination: 'Madurai', duration: '2 days', budget: '₹7,000', tags: ['Temple', 'Culture'] },
    { title: 'Aurangabad Ajanta Ellora', creator: 'CaveLover', rating: 4.7, ratings: 70, vibe: 'cultural', destination: 'Aurangabad', duration: '3 days', budget: '₹11,000', tags: ['Caves', 'UNESCO'] },
    { title: 'Chikmagalur Coffee Trails', creator: 'BeanStalk', rating: 4.7, ratings: 48, vibe: 'adventure', destination: 'Chikmagalur', duration: '3 days', budget: '₹9,000', tags: ['Coffee', 'Trek'] },
    { title: 'Dandeli River Rafting', creator: 'RapidRider', rating: 4.6, ratings: 37, vibe: 'adventure', destination: 'Dandeli', duration: '2 days', budget: '₹7,500', tags: ['Rafting', 'Jungle'] },
    { title: 'Wayanad Jungle Retreat', creator: 'GreenHaven', rating: 4.8, ratings: 81, vibe: 'adventure', destination: 'Wayanad', duration: '3 days', budget: '₹11,000', tags: ['Jungle', 'Waterfalls'] },
    { title: 'Kanyakumari Sunrise', creator: 'SouthernTip', rating: 4.7, ratings: 55, vibe: 'cultural', destination: 'Kanyakumari', duration: '2 days', budget: '₹7,000', tags: ['Sunrise', 'Ocean'] },
    { title: 'Tirupati Balaji Darshan', creator: 'DivineSoul', rating: 4.9, ratings: 150, vibe: 'cultural', destination: 'Tirupati', duration: '2 days', budget: '₹5,000', tags: ['Temple', 'Pilgrimage'] },
    { title: 'Shirdi Sai Baba', creator: 'FaithWalker', rating: 4.8, ratings: 95, vibe: 'cultural', destination: 'Shirdi', duration: '2 days', budget: '₹5,500', tags: ['Temple', 'Spiritual'] },
    { title: 'Bikaner Junagarh Fort', creator: 'DesertPrince', rating: 4.5, ratings: 28, vibe: 'cultural', destination: 'Bikaner', duration: '2 days', budget: '₹8,000', tags: ['Fort', 'Desert'] },
    { title: 'Almora & Binsar Wildlife', creator: 'Kumaoni', rating: 4.6, ratings: 34, vibe: 'adventure', destination: 'Almora', duration: '3 days', budget: '₹10,000', tags: ['Wildlife', 'Hills'] },
    { title: 'Kaziranga Rhino Quest', creator: 'AssamExplorer', rating: 4.6, ratings: 33, vibe: 'adventure', destination: 'Kaziranga', duration: '3 days', budget: '₹15,000', tags: ['Rhino', 'Wildlife'] },
    { title: 'Arunachal Tawang Monastery', creator: 'EasternEdge', rating: 4.7, ratings: 29, vibe: 'cultural', destination: 'Arunachal', duration: '5 days', budget: '₹20,000', tags: ['Monastery', 'Snow'] },
    { title: 'Varkala Cliff & Yoga Retreat', creator: 'SoulSearcher', rating: 4.8, ratings: 77, vibe: 'beach', destination: 'Varkala', duration: '4 days', budget: '₹10,000', tags: ['Yoga', 'Beach'] },
];

const trendingTrips = trips.slice(0, 4);

const vibeEmoji = (vibe: string) => {
    if (vibe === 'adventure') return '🏔️';
    if (vibe === 'beach') return '🏖️';
    return '🏛️';
};

const Community: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState('grid');
    const [clonedMsg, setClonedMsg] = useState('');

    const handleClone = (title: string) => {
        const trip = trips.find(t => t.title === title);
        if (!trip) return;
        saveTrip({
            planId: 'community-' + Date.now(),
            destination: trip.destination,
            origin: '',
            startDate: '',
            endDate: '',
            travelers: '',
            budget: trip.budget.replace('₹', '').replace(',', ''),
            totalEstimatedCost: 0,
            vibe: trip.vibe,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
        });
        setClonedMsg(title);
    };

    useEffect(() => {
        if (!clonedMsg) return;
        const t = setTimeout(() => setClonedMsg(''), 3000);
        return () => clearTimeout(t);
    }, [clonedMsg]);

    const filteredTrips = trips.filter(t => {
        const matchFilter = activeFilter === 'all' || t.vibe === activeFilter;
        const matchSearch =
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.creator.toLowerCase().includes(searchTerm.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <React.Fragment>
            {clonedMsg && (
                <div style={{ background: '#E6FFFA', padding: '14px 24px', borderRadius: '20px', margin: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ "{clonedMsg}" cloned to your dashboard!</span>
                    <span style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/dashboard')}>View Dashboard →</span>
                </div>
            )}
            <div className="community-hero">
                <h1>Community <span className="gradient-text">Itineraries</span></h1>
                <p>Discover, clone, and customize trips from fellow travelers across India.</p>
            </div>

            {/* Search + Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <span style={{ marginRight: '8px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by destination, vibe, or creator..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '16px 10px', border: 'none', background: 'transparent', outline: 'none', fontSize: '16px' }}
                    />
                </div>
                <div className="filter-group">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'adventure', label: '🏔️ Adventure' },
                        { key: 'cultural', label: '🏛️ Cultural' },
                        { key: 'beach', label: '🏖️ Beach' },
                        { key: 'budget', label: '🎒 Budget' },
                    ].map(f => (
                        <div
                            key={f.key}
                            className={`filter-chip${activeFilter === f.key ? ' active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                        </div>
                    ))}
                </div>
                <div className="view-toggle">
                    <button className={`view-btn${currentView === 'grid' ? ' active' : ''}`} onClick={() => setCurrentView('grid')}>📱 Grid</button>
                    <button className={`view-btn${currentView === 'list' ? ' active' : ''}`} onClick={() => setCurrentView('list')}>📋 List</button>
                </div>
            </div>

            {/* Trending */}
            <div className="trending-section">
                <h2>🔥 Trending This Week</h2>
                <div className="community-trending-grid">
                    {trendingTrips.map(t => (
                        <div key={t.title} className="community-trending-card" onClick={() => handleClone(t.title)}>
                            <span style={{ fontSize: '32px' }}>{vibeEmoji(t.vibe)}</span>
                            <div>
                                <h4>{t.title}</h4>
                                <p style={{ color: '#64748B' }}>{t.rating} ★ · {t.creator}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <h2 style={{ margin: '30px 0 20px' }}>All Community Trips</h2>

            {/* Grid / List */}
            <div className={currentView === 'grid' ? 'itinerary-grid' : 'itinerary-list'}>
                {filteredTrips.map((t, i) =>
                    currentView === 'grid' ? (
                        <div
                            key={t.title}
                            className="itinerary-card"
                            style={{ animationDelay: `${i * 0.02}s` }}
                            onClick={() => handleClone(t.title)}
                        >
                            <div className="card-header">
                                <span className="vibe-badge">{t.vibe}</span>
                                <span className="rating">★ {t.rating} ({t.ratings})</span>
                            </div>
                            <h3 className="trip-title-community">{t.title}</h3>
                            <p style={{ color: '#64748B', marginBottom: '8px' }}>by {t.creator}</p>
                            <div className="trip-meta-community">
                                <span>📍 {t.destination}</span>
                                <span>📅 {t.duration}</span>
                            </div>
                            <div className="trip-footer-community">
                                <span className="price">{t.budget}</span>
                                <button
                                    className="btn-outline"
                                    style={{ padding: '8px 16px' }}
                                    onClick={e => { e.stopPropagation(); handleClone(t.title); }}
                                >
                                    📋 Clone
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={t.title}
                            className="list-item"
                            style={{ animationDelay: `${i * 0.02}s` }}
                            onClick={() => handleClone(t.title)}
                        >
                            <div style={{ fontSize: '40px' }}>{vibeEmoji(t.vibe)}</div>
                            <div className="list-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>{t.title}</h3>
                                    <span>★ {t.rating} ({t.ratings})</span>
                                </div>
                                <p style={{ color: '#64748B', margin: '4px 0' }}>by {t.creator} · {t.destination} · {t.duration}</p>
                                <div style={{ display: 'flex', gap: '8px', margin: '8px 0', flexWrap: 'wrap' }}>
                                    {t.tags.map(tg => (
                                        <span key={tg} style={{ background: '#F1F5F9', padding: '4px 12px', borderRadius: '40px', fontSize: '12px' }}>{tg}</span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="price">{t.budget}</span>
                                    <button className="btn-outline" onClick={e => { e.stopPropagation(); handleClone(t.title); }}>
                                        📋 Clone
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </React.Fragment>
    );
};

export default Community;
