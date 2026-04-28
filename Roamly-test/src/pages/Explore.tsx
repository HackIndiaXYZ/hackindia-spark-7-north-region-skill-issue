import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const destinations = [
    // Rajasthan
    { name: 'Jaipur', region: 'Rajasthan', type: 'heritage', safety: 89, peak: true, features: ['Forts', 'Palaces', 'Bazaars'], price: '₹12,000', img: 'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop)', desc: 'The Pink City — Amber Fort, Hawa Mahal, City Palace, vibrant bazaars.' },
    { name: 'Udaipur', region: 'Rajasthan', type: 'heritage', safety: 91, peak: false, features: ['Lakes', 'Palaces', 'Romantic'], price: '₹15,000', img: 'url(https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop)', desc: 'City of Lakes — Lake Pichola, City Palace, Jag Mandir, sunset boat rides.' },
    { name: 'Jodhpur', region: 'Rajasthan', type: 'heritage', safety: 87, peak: true, features: ['Forts', 'Blue City'], price: '₹10,000', img: 'url(https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop)', desc: 'Blue City — Mehrangarh Fort, Umaid Bhawan, blue-painted old city.' },
    { name: 'Jaisalmer', region: 'Rajasthan', type: 'desert', safety: 86, peak: false, features: ['Desert', 'Fort', 'Camel Safari'], price: '₹14,000', img: 'url(https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop)', desc: 'Golden City — Jaisalmer Fort, Sam Sand Dunes, desert camping.' },
    { name: 'Pushkar', region: 'Rajasthan', type: 'heritage', safety: 88, peak: true, features: ['Holy Lake', 'Temples'], price: '₹8,000', img: 'url(https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&h=400&fit=crop)', desc: 'Sacred town — Pushkar Lake, Brahma Temple, vibrant bazaars.' },
    { name: 'Mount Abu', region: 'Rajasthan', type: 'mountains', safety: 90, peak: false, features: ['Hill Station', 'Lakes'], price: '₹11,000', img: 'linear-gradient(145deg, #8CAC8C, #6A8C6A)', desc: 'Only hill station of Rajasthan — Nakki Lake, Dilwara Temples.' },
    // Goa
    { name: 'North Goa', region: 'Goa', type: 'beaches', safety: 85, peak: true, features: ['Beaches', 'Nightlife'], price: '₹18,000', img: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop)', desc: 'Party capital — Baga, Calangute, Anjuna, beach shacks.' },
    { name: 'South Goa', region: 'Goa', type: 'beaches', safety: 88, peak: false, features: ['Peaceful', 'Secluded'], price: '₹14,000', img: 'url(https://images.unsplash.com/photo-1569316449810-9dc87c6b4f76?w=600&h=400&fit=crop)', desc: 'Serene escape — Palolem, Colva, quiet cafes.' },
    { name: 'Panaji', region: 'Goa', type: 'heritage', safety: 87, peak: true, features: ['Portuguese', 'Casinos'], price: '₹13,000', img: 'linear-gradient(145deg, #B4A47C, #94845C)', desc: 'Capital city — Fontainhas, casinos, Mandovi River cruises.' },
    // Kerala
    { name: 'Munnar', region: 'Kerala', type: 'mountains', safety: 93, peak: true, features: ['Tea Gardens', 'Hills'], price: '₹13,000', img: 'url(https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&h=400&fit=crop)', desc: 'Tea country — Endless plantations, Eravikulam National Park.' },
    { name: 'Alleppey', region: 'Kerala', type: 'backwaters', safety: 92, peak: false, features: ['Backwaters', 'Houseboats'], price: '₹16,000', img: 'url(https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&h=400&fit=crop)', desc: 'Venice of the East — Houseboat stays, backwater cruises.' },
    { name: 'Kochi', region: 'Kerala', type: 'heritage', safety: 89, peak: false, features: ['Colonial', 'Chinese Nets'], price: '₹14,000', img: 'url(https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&h=400&fit=crop)', desc: 'Queen of Arabian Sea — Fort Kochi, Chinese nets, Jewish Synagogue.' },
    { name: 'Kumarakom', region: 'Kerala', type: 'backwaters', safety: 91, peak: false, features: ['Backwaters', 'Bird Sanctuary'], price: '₹15,000', img: 'linear-gradient(145deg, #6CAC8C, #4A8C6C)', desc: 'Serene backwater village — Bird sanctuary, luxury resorts.' },
    { name: 'Thekkady', region: 'Kerala', type: 'wildlife', safety: 90, peak: true, features: ['Wildlife', 'Spice'], price: '₹12,000', img: 'linear-gradient(145deg, #5C9C6C, #3A7C4C)', desc: 'Periyar Tiger Reserve — Boat safaris, spice gardens.' },
    { name: 'Varkala', region: 'Kerala', type: 'beaches', safety: 88, peak: false, features: ['Cliff Beach', 'Yoga'], price: '₹10,000', img: 'linear-gradient(145deg, #BCA47C, #9C846C)', desc: 'Cliffside beach — Papanasam Beach, yoga retreats.' },
    // Himachal Pradesh
    { name: 'Manali', region: 'Himachal', type: 'mountains', safety: 90, peak: true, features: ['Adventure', 'Snow'], price: '₹15,000', img: 'url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=400&fit=crop)', desc: 'Mountain paradise — Solang Valley, Rohtang Pass, Old Manali.' },
    { name: 'Shimla', region: 'Himachal', type: 'mountains', safety: 92, peak: false, features: ['Colonial', 'Toy Train'], price: '₹12,000', img: 'url(https://images.unsplash.com/photo-1597074866923-dc0589150358?w=600&h=400&fit=crop)', desc: 'Queen of Hills — Mall Road, Ridge, toy train.' },
    { name: 'Kasol', region: 'Himachal', type: 'mountains', safety: 86, peak: true, features: ['Backpacker', 'Trekking'], price: '₹9,000', img: 'linear-gradient(145deg, #BC9C7C, #9C7C5C)', desc: 'Mini Israel — Parvati Valley, Kheerganga trek, Israeli cafes.' },
    { name: 'Dharamshala', region: 'Himachal', type: 'mountains', safety: 91, peak: false, features: ['Tibetan', 'Spiritual'], price: '₹11,000', img: 'linear-gradient(145deg, #7C8C9C, #5A6C7C)', desc: 'Little Lhasa — Dalai Lama temple, Triund trek, Tibetan culture.' },
    { name: 'Spiti', region: 'Himachal', type: 'mountains', safety: 85, peak: true, features: ['Cold Desert', 'Monasteries'], price: '₹20,000', img: 'linear-gradient(145deg, #C8A8D8, #A888B8)', desc: 'Cold desert — Key Monastery, Chandratal Lake, surreal landscapes.' },
    // Uttarakhand
    { name: 'Rishikesh', region: 'Uttarakhand', type: 'mountains', safety: 88, peak: true, features: ['Yoga', 'Rafting'], price: '₹10,000', img: 'url(https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=600&h=400&fit=crop)', desc: 'Yoga capital — River rafting, Ganga Aarti, Beatles Ashram.' },
    { name: 'Nainital', region: 'Uttarakhand', type: 'mountains', safety: 91, peak: false, features: ['Lake', 'Hill Station'], price: '₹12,000', img: 'linear-gradient(145deg, #5C8CA4, #3A6C84)', desc: 'Lake District — Naini Lake, Snow View Point, Mall Road.' },
    { name: 'Mussoorie', region: 'Uttarakhand', type: 'mountains', safety: 90, peak: true, features: ['Hill Station', 'Waterfalls'], price: '₹11,000', img: 'linear-gradient(145deg, #7C9C7C, #5A7C5A)', desc: "Queen of Hills — Kempty Falls, Gun Hill, Camel's Back Road." },
    { name: 'Auli', region: 'Uttarakhand', type: 'mountains', safety: 89, peak: true, features: ['Skiing', 'Snow'], price: '₹16,000', img: 'linear-gradient(145deg, #B0C4DE, #90A4BE)', desc: 'Ski destination — Snow-capped peaks, ropeway, winter sports.' },
    // Karnataka
    { name: 'Coorg', region: 'Karnataka', type: 'mountains', safety: 92, peak: false, features: ['Coffee', 'Waterfalls'], price: '₹13,000', img: 'url(https://images.unsplash.com/photo-1614594979456-522e0656b50e?w=600&h=400&fit=crop)', desc: 'Scotland of India — Coffee plantations, Abbey Falls, misty hills.' },
    { name: 'Hampi', region: 'Karnataka', type: 'heritage', safety: 87, peak: true, features: ['Ruins', 'Bouldering'], price: '₹11,000', img: 'url(https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop)', desc: 'UNESCO site — Vijayanagara ruins, boulder-strewn landscape.' },
    { name: 'Mysore', region: 'Karnataka', type: 'heritage', safety: 90, peak: true, features: ['Palace', 'Yoga'], price: '₹10,000', img: 'url(https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=600&h=400&fit=crop)', desc: 'Royal heritage — Mysore Palace, Chamundi Hills, Brindavan Gardens.' },
    { name: 'Gokarna', region: 'Karnataka', type: 'beaches', safety: 86, peak: false, features: ['Beaches', 'Trekking'], price: '₹9,000', img: 'linear-gradient(145deg, #7CAC7C, #5A8C5C)', desc: 'Hippie beach town — Om Beach, Kudle Beach, beach trek.' },
    // Tamil Nadu
    { name: 'Ooty', region: 'Tamil Nadu', type: 'mountains', safety: 91, peak: true, features: ['Hill Station', 'Toy Train'], price: '₹13,000', img: 'linear-gradient(145deg, #6C9C7C, #4A7C5C)', desc: 'Queen of Hills — Nilgiri Mountain Railway, Botanical Gardens.' },
    { name: 'Kodaikanal', region: 'Tamil Nadu', type: 'mountains', safety: 90, peak: false, features: ['Lake', 'Forests'], price: '₹12,000', img: 'linear-gradient(145deg, #5C8C7C, #3A6C5C)', desc: "Princess of Hills — Kodai Lake, Coaker's Walk, pine forests." },
    { name: 'Rameswaram', region: 'Tamil Nadu', type: 'heritage', safety: 88, peak: true, features: ['Temple', 'Pamban Bridge'], price: '₹11,000', img: 'linear-gradient(145deg, #AC9C8C, #8C7C6C)', desc: 'Sacred island — Ramanathaswamy Temple, Dhanushkodi.' },
    // Maharashtra
    { name: 'Mumbai', region: 'Maharashtra', type: 'heritage', safety: 84, peak: true, features: ['Cosmopolitan', 'Marine Drive'], price: '₹20,000', img: 'url(https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&h=400&fit=crop)', desc: 'City of Dreams — Gateway of India, Marine Drive, Bollywood.' },
    { name: 'Lonavala', region: 'Maharashtra', type: 'mountains', safety: 89, peak: true, features: ['Hill Station', 'Caves'], price: '₹9,000', img: 'linear-gradient(145deg, #5C8C5C, #3A6C3A)', desc: "Weekend getaway — Tiger's Leap, Bhushi Dam, Karla Caves." },
    { name: 'Aurangabad', region: 'Maharashtra', type: 'heritage', safety: 87, peak: true, features: ['Caves', 'UNESCO'], price: '₹11,000', img: 'linear-gradient(145deg, #9C8C6C, #7C6C4C)', desc: 'Gateway to Ajanta & Ellora Caves UNESCO World Heritage Sites.' },
    // West Bengal
    { name: 'Darjeeling', region: 'West Bengal', type: 'mountains', safety: 88, peak: true, features: ['Tea', 'Toy Train'], price: '₹15,000', img: 'url(https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop)', desc: 'Queen of Hills — Tiger Hill sunrise, toy train, tea estates.' },
    { name: 'Kolkata', region: 'West Bengal', type: 'heritage', safety: 85, peak: true, features: ['Colonial', 'Culture'], price: '₹14,000', img: 'url(https://images.unsplash.com/photo-1558431382-27e303142255?w=600&h=400&fit=crop)', desc: 'Cultural capital — Victoria Memorial, Howrah Bridge, Rosogolla.' },
    // Andaman
    { name: 'Andaman', region: 'Andaman & Nicobar', type: 'beaches', safety: 92, peak: false, features: ['Scuba', 'Cellular Jail'], price: '₹25,000', img: 'url(https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=600&h=400&fit=crop)', desc: 'Tropical paradise — Radhanagar Beach, Havelock Island, scuba diving.' },
    // Ladakh
    { name: 'Leh Ladakh', region: 'Ladakh', type: 'mountains', safety: 87, peak: true, features: ['High Passes', 'Monasteries'], price: '₹22,000', img: 'url(https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=600&h=400&fit=crop)', desc: 'Land of high passes — Pangong Lake, Khardung La, Nubra Valley.' },
    // Madhya Pradesh
    { name: 'Khajuraho', region: 'Madhya Pradesh', type: 'heritage', safety: 86, peak: false, features: ['Temples', 'Sculptures'], price: '₹12,000', img: 'linear-gradient(145deg, #C4A474, #A48454)', desc: 'UNESCO temples — Intricate carvings, light and sound show.' },
    { name: 'Bandhavgarh', region: 'Madhya Pradesh', type: 'wildlife', safety: 88, peak: true, features: ['Tiger Safari'], price: '₹18,000', img: 'linear-gradient(145deg, #5C7C3C, #3A5C2A)', desc: 'Tiger reserve — High density of Royal Bengal Tigers.' },
    // Uttar Pradesh
    { name: 'Varanasi', region: 'Uttar Pradesh', type: 'heritage', safety: 84, peak: true, features: ['Ghats', 'Spiritual'], price: '₹11,000', img: 'url(https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&h=400&fit=crop)', desc: 'Spiritual capital — Ganga Aarti, ancient temples, narrow alleys.' },
    { name: 'Agra', region: 'Uttar Pradesh', type: 'heritage', safety: 85, peak: true, features: ['Taj Mahal', 'Forts'], price: '₹13,000', img: 'url(https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop)', desc: 'City of Taj — Taj Mahal, Agra Fort, Fatehpur Sikri.' },
    // Gujarat
    { name: 'Rann of Kutch', region: 'Gujarat', type: 'desert', safety: 87, peak: true, features: ['White Desert', 'Festival'], price: '₹14,000', img: 'linear-gradient(145deg, #E8E0D0, #C8C0B0)', desc: 'White salt desert — Rann Utsav, cultural performances, full moon.' },
    { name: 'Gir', region: 'Gujarat', type: 'wildlife', safety: 88, peak: false, features: ['Asiatic Lions', 'Safari'], price: '₹15,000', img: 'linear-gradient(145deg, #6C8C4C, #4A6C2A)', desc: 'Last abode of Asiatic Lions — Jeep safari, diverse wildlife.' },
];

const trending = [
    { name: 'Manali', region: 'Himachal', growth: '+156%' },
    { name: 'Kochi', region: 'Kerala', growth: '+89%' },
    { name: 'Jaisalmer', region: 'Rajasthan', growth: '+67%' },
    { name: 'Varkala', region: 'Kerala', growth: '+45%' },
];

const filters = [
    { key: 'all', label: 'All' },
    { key: 'mountains', label: '🏔️ Mountains' },
    { key: 'beaches', label: '🏖️ Beaches' },
    { key: 'heritage', label: '🏛️ Heritage' },
    { key: 'backwaters', label: '🚤 Backwaters' },
    { key: 'desert', label: '🏜️ Desert' },
    { key: 'wildlife', label: '🐅 Wildlife' },
];

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState('grid');
    const [selectedDest, setSelectedDest] = useState<any>(null);
    const [liveSafety, setLiveSafety] = useState<{ score: number; label: string; details: string } | null>(null);

    const openDest = (d: any) => {
        setSelectedDest(d);
        setLiveSafety(null);
        fetch(`http://localhost:8080/api/safety?destination=${encodeURIComponent(d.name)}`)
            .then(r => r.ok ? r.json() : null)
            .then(s => { if (s?.score) setLiveSafety(s); })
            .catch(() => {});
    };

    const filtered = destinations.filter(d => {
        const matchesFilter = activeFilter === 'all' || d.type === activeFilter;
        const matchesSearch =
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.region.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <React.Fragment>
            <div className="explore-hero">
                <h1>Discover <span className="gradient-text">Incredible India</span></h1>
                <p>From the Himalayas to the backwaters. Curated Indian destinations with safety scores, peak seasons, and local insights.</p>
            </div>

            <div className="search-filter-bar">
                <div className="search-box">
                    <span style={{ marginRight: '8px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '16px 10px', border: 'none', background: 'transparent', outline: 'none', fontSize: '16px' }}
                    />
                </div>
                <div className="filter-group">
                    {filters.map(f => (
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

            <div className={currentView === 'grid' ? 'explore-dest-grid' : 'dest-list'}>
                {filtered.map((d, i) =>
                    currentView === 'grid' ? (
                        <div key={d.name} className="dest-card" style={{ animationDelay: `${i * 0.02}s` }} onClick={() => openDest(d)}>
                            <div className="dest-img" style={{ backgroundImage: d.img, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="dest-info">
                                <div className="dest-header">
                                    <span className="dest-name">{d.name}</span>
                                    <span className="safety-badge">🛡️ {d.safety}</span>
                                </div>
                                <div className="dest-region">
                                    📍 {d.region} ·{' '}
                                    {d.peak
                                        ? <span className="peak-badge">📈 Peak</span>
                                        : <span className="offpeak-badge">📉 Off‑peak</span>}
                                </div>
                                <div className="dest-features">
                                    {d.features.slice(0, 3).map(f => <span key={f} className="feature-tag">{f}</span>)}
                                </div>
                                <div className="dest-footer">
                                    <span className="price">From {d.price}</span>
                                    <button className="btn-plan" onClick={e => { e.stopPropagation(); navigate('/planner', { state: { destination: d.name } }); }}>Plan →</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div key={d.name} className="list-item" style={{ animationDelay: `${i * 0.02}s` }} onClick={() => openDest(d)}>
                            <div className="list-img" style={{ backgroundImage: d.img, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="list-content">
                                <div className="list-header">
                                    <span className="list-name">{d.name}</span>
                                    <span className="safety-badge">🛡️ {d.safety}</span>
                                </div>
                                <div className="list-meta">
                                    <span>📍 {d.region}</span>
                                    {d.peak ? <span className="peak-badge">📈 Peak</span> : <span className="offpeak-badge">📉 Off‑peak</span>}
                                </div>
                                <div className="list-features">
                                    {d.features.slice(0, 4).map(f => <span key={f} className="feature-tag">{f}</span>)}
                                </div>
                                <div className="list-footer">
                                    <span className="list-price">From {d.price}</span>
                                    <button className="btn-plan" onClick={e => { e.stopPropagation(); navigate('/planner', { state: { destination: d.name } }); }}>Plan →</button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Trending */}
            <div className="trending-section">
                <div className="section-header">
                    <h2>🔥 Trending in India This Week</h2>
                    <span
                        style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => { setActiveFilter('all'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    >
                        View all →
                    </span>
                </div>
                <div className="explore-trending-grid">
                    {trending.map((t, i) => (
                        <div
                            key={t.name}
                            className="explore-trending-card"
                            onClick={() => { const found = destinations.find(d => d.name === t.name); if (found) openDest(found); }}
                        >
                            <span className="trend-rank">#{i + 1}</span>
                            <div className="trend-info-explore">
                                <h4>{t.name}</h4>
                                <p>{t.region} · {t.growth}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Banner */}
            <div className="cta-banner">
                <div>
                    <h2>Ready to explore India?</h2>
                    <p style={{ opacity: 0.8 }}>Let AI plan your perfect Indian trip in seconds.</p>
                </div>
                <button className="cta-btn" onClick={() => navigate('/planner')}>Start Planning →</button>
            </div>

            {/* Detail Modal */}
            {selectedDest && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setSelectedDest(null); }}>
                    <div className="explore-modal">
                        <span className="modal-close" onClick={() => setSelectedDest(null)}>&times;</span>
                        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>{selectedDest.name}</h2>
                        <p style={{ color: '#64748B', marginBottom: '20px' }}>
                            📍 {selectedDest.region} · {selectedDest.peak ? '📈 Peak Season' : '📉 Off‑season'}
                        </p>
                        <div style={{ background: selectedDest.img, height: '160px', borderRadius: '24px', marginBottom: '20px' }}></div>
                        <p style={{ marginBottom: '16px' }}>{selectedDest.desc}</p>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <span className="safety-badge">🛡️ Safety {liveSafety ? `${liveSafety.score}/100 · ${liveSafety.label}` : `${selectedDest.safety}/100`}</span>
                            <span className="feature-tag">From {selectedDest.price}</span>
                        </div>
                        {liveSafety?.details && (
                            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>ℹ️ {liveSafety.details}</p>
                        )}
                        <h3>✨ Top Attractions</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '16px 0' }}>
                            {selectedDest.features.map((f: string) => <span key={f} className="feature-tag">{f}</span>)}
                        </div>
                        <button
                            className="btn-plan"
                            style={{ width: '100%', padding: '16px' }}
                            onClick={() => navigate('/planner', { state: { destination: selectedDest.name } })}
                        >
                            Plan this trip →
                        </button>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default Explore;
