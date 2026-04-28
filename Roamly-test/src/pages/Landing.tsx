import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NearMeModal from '../components/NearMeModal';
import { useToast } from '../context/ToastContext';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isSurprising, setIsSurprising] = useState(false);
    const [surpriseData, setSurpriseData] = useState<any>(null);
    const [isNearMeOpen, setIsNearMeOpen] = useState(false);
    const [searchDest, setSearchDest] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const handleSurpriseClick = async () => {
        setIsSurprising(true);
        setSurpriseData(null);
        try {
            const res = await fetch('http://localhost:8080/api/surprise', { cache: 'no-store' });
            const data = await res.json();
            if (res.ok) {
                setSurpriseData(data);
            } else {
                showToast('Surprise AI Error: ' + (data.error || 'Failed'), 'error');
            }
        } catch {
            showToast('Network Error: Could not connect to backend at http://localhost:8080', 'error');
        } finally {
            setIsSurprising(false);
        }
    };

    return (
        <React.Fragment>
            {/* SURPRISE ME MODAL */}
            {(isSurprising || surpriseData) && (
                <div
                    onClick={() => { setIsSurprising(false); setSurpriseData(null); }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '40px', padding: '44px', width: '90%', maxWidth: '480px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
                        <button
                            onClick={() => { setIsSurprising(false); setSurpriseData(null); }}
                            style={{ position: 'absolute', top: '24px', right: '32px', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                        >&times;</button>

                        {isSurprising ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '48px' }}>🌍</div>
                                <h3 style={{ fontSize: '24px', margin: '16px 0 8px' }}>AI is scanning the globe...</h3>
                                <p style={{ color: '#64748B' }}>Analyzing weather, festivals, and hidden gems.</p>
                                <div className="progress-slide-track">
                                    <div className="progress-slide-fill"></div>
                                </div>
                            </div>
                        ) : surpriseData ? (
                            <div>
                                <span style={{ background: '#EEF2FF', color: '#2563EB', padding: '6px 16px', borderRadius: '40px', fontSize: '14px', fontWeight: 600 }}>{surpriseData.vibe}</span>
                                <h2 style={{ fontSize: '32px', margin: '12px 0 8px' }}>{surpriseData.destination}</h2>
                                <p style={{ color: '#475569', fontSize: '16px', fontStyle: 'italic', marginBottom: '24px' }}>"{surpriseData.description}"</p>
                                <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '20px', marginBottom: '24px' }}>
                                    <h4 style={{ marginBottom: '12px' }}>Top Highlights</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {surpriseData.placesToVisit?.map((place: string, i: number) => (
                                            <li key={i} style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}><span style={{ color: '#2563EB' }}>✦</span>{place}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '16px', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/planner', { state: { destination: surpriseData.destination, vibe: surpriseData.vibe } })}>
                                    Plan This Trip →
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* NEAR ME MODAL */}
            <NearMeModal isOpen={isNearMeOpen} onClose={() => setIsNearMeOpen(false)} />

            {/* HERO */}
            <div className="hero">
                <div>
                    <span className="badge">✨ 40+ AI‑Powered Features · Live Replan</span>
                    <h1 className="headline">Plan <span className="gradient-text">Less.</span><br />Roam <span className="gradient-text">More.</span></h1>
                    <p className="subhead">Vibe‑based, weather‑aware itineraries with safety scores, budget tracking, and dynamic replanning — all in one place.</p>
                    <datalist id="heroDestSuggestions">
                        {['Jaipur','Goa','Kerala','Manali','Udaipur','Varanasi','Mumbai','Darjeeling','Shimla','Rishikesh','Leh Ladakh','Ooty','Coorg','Agra'].map(d => (
                            <option key={d} value={d} />
                        ))}
                    </datalist>
                    <div className="search-bar">
                        <div className="search-item"><span className="search-icon">🌍</span><input className="search-input" placeholder="Where to?" list="heroDestSuggestions" value={searchDest} onChange={e => setSearchDest(e.target.value)} /></div>
                        <div className="search-item"><span className="search-icon">📅</span><input className="search-input" placeholder="Dates" value={searchDate} onChange={e => setSearchDate(e.target.value)} /></div>
                        <button className="btn-primary" onClick={() => navigate('/planner', { state: { destination: searchDest } })}>Start planning</button>
                    </div>
                    <div className="action-chips">
                        <div className="chip" onClick={handleSurpriseClick}>🎲 Surprise Me</div>
                        <div className="chip" onClick={() => setIsNearMeOpen(true)}>📍 Near Me</div>
                    </div>
                </div>
                <div className="preview-card">
                    <div className="stats-row">
                        <div><div className="stat-value">10K+</div><div className="stat-label">TRIPS</div></div>
                        <div><div className="stat-value">500+</div><div className="stat-label">CITIES</div></div>
                        <div><div className="stat-value">98%</div><div className="stat-label">HAPPY</div></div>
                    </div>
                    <div className="dest-grid">
                        <div className="dest-thumb" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&h=200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={() => showToast('Jaipur · Safety Score 89 · Peak Season', 'info')}><span>Jaipur</span></div>
                        <div className="dest-thumb" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=300&h=200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={() => showToast('Kerala · Safety Score 92 · Off-season deals', 'info')}><span>Kerala</span></div>
                        <div className="dest-thumb" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&h=200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={() => showToast('Goa · Safety Score 85 · Peak Season', 'info')}><span>Goa</span></div>
                        <div className="dest-thumb" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&h=200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={() => showToast('Himachal · Safety Score 90 · Adventure ready', 'info')}><span>Himachal</span></div>
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <h2 className="section-title">Everything you need, built right in</h2>
            <div className="features-grid">
                <div className="feature-card"><div className="feature-icon">🎯</div><h3>Vibe‑Based Planning</h3><p>Mood cards — Adventure, Foodie, Romantic, Backpacker.</p></div>
                <div className="feature-card"><div className="feature-icon">🔄</div><h3>Dynamic Re‑Planning</h3><p>Skip any activity, AI regenerates the rest of your day.</p></div>
                <div className="feature-card"><div className="feature-icon">⛅</div><h3>Weather‑Aware</h3><p>Outdoor plans shift based on 7‑day forecast.</p></div>
                <div className="feature-card"><div className="feature-icon">💰</div><h3>Budget Tracker</h3><p>Real‑time spending vs budget with alerts.</p></div>
                <div className="feature-card"><div className="feature-icon">👥</div><h3>Group Optimization</h3><p>Solo, Couple, Family, Friends — pacing adjusted.</p></div>
                <div className="feature-card"><div className="feature-icon">💎</div><h3>Hidden Gems Mode</h3><p>Skip tourist traps, discover local favorites.</p></div>
                <div className="feature-card"><div className="feature-icon">🗺️</div><h3>Interactive Map</h3><p>Pins, routes, and day‑by‑day views.</p></div>
                <div className="feature-card"><div className="feature-icon">🛡️</div><h3>Safety Scores</h3><p>Crime data, solo female safety, emergency contacts.</p></div>
            </div>

            {/* TRENDING */}
            <h2 className="section-title">🔥 Trending This Week</h2>
            <div className="trending-grid">
                <div className="trending-card">
                    <div className="trend-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=220&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="trend-info"><h3>Jaipur</h3><p>Safety 89 · 📈 Peak</p><button className="btn-outline" style={{ marginTop: '12px', padding: '8px 16px' }} onClick={() => navigate('/explore')}>Explore →</button></div>
                </div>
                <div className="trending-card">
                    <div className="trend-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=400&h=220&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="trend-info"><h3>Kerala</h3><p>Safety 92 · 📉 Off‑season</p><button className="btn-outline" style={{ marginTop: '12px', padding: '8px 16px' }} onClick={() => navigate('/explore')}>Explore →</button></div>
                </div>
                <div className="trending-card">
                    <div className="trend-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=220&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="trend-info"><h3>Goa</h3><p>Safety 85 · 📈 Peak</p><button className="btn-outline" style={{ marginTop: '12px', padding: '8px 16px' }} onClick={() => navigate('/explore')}>Explore →</button></div>
                </div>
                <div className="trending-card">
                    <div className="trend-img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=220&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="trend-info"><h3>Manali</h3><p>Safety 90 · Adventure</p><button className="btn-outline" style={{ marginTop: '12px', padding: '8px 16px' }} onClick={() => navigate('/explore')}>Explore →</button></div>
                </div>
            </div>

            {/* INFO PANELS */}
            <div className="info-panel">
                <div className="panel-card">
                    <h3>🛡️ Destination Safety (Jaipur)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#10B981 0deg 320deg, #E5E7EB 320deg 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'rotateScore 4s infinite alternate' }}>
                            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: '#10B981' }}>89</div>
                        </div>
                        <div><strong>Very Safe</strong><br />Low crime, tourist friendly</div>
                    </div>
                    <p>Emergency: 100 · Tourist Helpline: 1363</p>
                </div>
                <div className="panel-card">
                    <h3>⛅ 7‑Day Forecast</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginTop: '20px' }}>
                        <div>Mon ☀️ 33°</div><div>Tue ⛅ 31°</div><div>Wed 🌧️ 28°</div><div>Thu ☀️ 34°</div>
                        <div>Fri ☀️ 35°</div><div>Sat ⛅ 32°</div><div>Sun ☀️ 33°</div>
                    </div>
                    <p style={{ marginTop: '20px' }}>✨ Outdoor activities placed on clear days.</p>
                </div>
            </div>

            {/* TESTIMONIALS */}
            <h2 className="section-title">💬 Traveler Stories</h2>
            <p style={{ color: '#64748B', marginBottom: '10px' }}>Real experiences from our community</p>
            <div className="testimonials-grid">
                <div className="testimonial-card">
                    <div className="quote-icon">"</div>
                    <div className="testimonial-text">Roamly planned my entire Rajasthan trip in seconds. The replan feature saved us when a fort closed!</div>
                    <div className="testimonial-author">
                        <div className="author-avatar">PM</div>
                        <div className="author-info"><h4>Priya M. <span className="destination-badge">📍 Rajasthan</span></h4><p>Delhi</p></div>
                    </div>
                </div>
                <div className="testimonial-card">
                    <div className="quote-icon">"</div>
                    <div className="testimonial-text">Budget tracking is spot on. We stayed under ₹25k for 5 days in Goa, all thanks to smart AI.</div>
                    <div className="testimonial-author">
                        <div className="author-avatar">AK</div>
                        <div className="author-info"><h4>Arjun K. <span className="destination-badge">📍 Goa</span></h4><p>Mumbai</p></div>
                    </div>
                </div>
                <div className="testimonial-card">
                    <div className="quote-icon">"</div>
                    <div className="testimonial-text">Weather shifted our plans, one tap and we had a new indoor itinerary. Incredible.</div>
                    <div className="testimonial-author">
                        <div className="author-avatar">MS</div>
                        <div className="author-info"><h4>Meera S. <span className="destination-badge">📍 Kerala</span></h4><p>Bangalore</p></div>
                    </div>
                </div>
            </div>

            {/* COMMUNITY TRIPS */}
            <h2 className="section-title">👥 Popular Community Trips</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
                <div className="panel-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>
                    <h3>✨ Jaipur 3‑day Cultural</h3><p>by TravelerAnjali · 4.8 ★</p><button className="btn-outline" style={{ marginTop: '16px' }}>Clone trip</button>
                </div>
                <div className="panel-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>
                    <h3>🏝️ Goa Budget Backpacking</h3><p>4.9 ★ · Hidden gems</p><button className="btn-outline" style={{ marginTop: '16px' }}>Clone trip</button>
                </div>
                <div className="panel-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>
                    <h3>⛰️ Manali Adventure Week</h3><p>4.7 ★ · Group friendly</p><button className="btn-outline" style={{ marginTop: '16px' }}>Clone trip</button>
                </div>
            </div>

            {/* CTA BANNER */}
            <div style={{ background: 'linear-gradient(145deg, #1E293B, #0F172A)', borderRadius: '48px', padding: '56px 48px', margin: '80px 0', textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: '48px', color: 'white' }}>Ready to Roam?</h2>
                <p style={{ fontSize: '20px', opacity: 0.9, margin: '20px 0 32px' }}>Join 25,000+ travelers using AI to plan perfect trips.</p>
                <Link to="/planner" className="btn-primary" style={{ padding: '18px 48px', fontSize: '18px' }}>Start Planning Now →</Link>
            </div>
        </React.Fragment>
    );
};

export default Landing;
