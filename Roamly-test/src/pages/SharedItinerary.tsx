import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import InteractiveJourneyMap from '../components/InteractiveJourneyMap';

const SharedItinerary: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const [planData, setPlanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/plan/${planId}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setPlanData(data);
            } catch (err) {
                setError('Failed to load itinerary. It may be private or invalid.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId]);

    const getVibeIcon = (vibe: string) => {
        switch(vibe) {
            case 'foodie': return '🍜';
            case 'adventure': return '🏔️';
            case 'culture': return '🏛️';
            case 'romantic': return '💑';
            case 'chill': return '😌';
            default: return '✨';
        }
    };

    if (loading) {
        return (
             <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                 <div style={{ fontSize: '48px', animation: 'iconPulse 2s infinite' }}>🌍</div>
                 <h2 style={{ fontSize: '24px', margin: '20px 0 10px' }}>Loading Trip Details...</h2>
             </div>
        );
    }

    if (error || !planData) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2>Oops!</h2>
                <p style={{ color: '#64748B', margin: '20px 0' }}>{error}</p>
                <Link to="/" className="btn-primary">Go to Home</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ animation: 'fadeUp 0.6s' }}>
            <div className="trip-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 30px', flexWrap: 'wrap', gap: '20px', marginTop: '100px' }}>
                <div className="trip-title">
                    <h1 style={{ fontSize: '42px', marginBottom: '8px' }}>{planData.destination} <span className="gradient-text">Adventure</span></h1>
                    <div className="trip-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span className="chip" style={{ background: 'white', border: '1px solid #E2E8F0', padding: '8px 18px', borderRadius: '40px', fontSize: '14px', fontWeight: 500 }}>👥 View-Only</span>
                    </div>
                </div>
            </div>

            <div className="map-preview" style={{ background: 'white', borderRadius: '32px', padding: '24px', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #F0F4F8', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px' }}>🗺️ Route Preview</h3>
                </div>
                <div style={{ height: '400px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <InteractiveJourneyMap origin="Virtual" destination={planData.destination} days={planData.days} />
                </div>
            </div>

            {planData.days?.map((day: any, dIndex: number) => (
                <div className="day-card" key={dIndex} style={{ background: 'white', borderRadius: '32px', padding: '28px', marginBottom: '24px', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #F0F4F8' }}>
                    <div className="day-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '24px' }}>Day {day.dayNumber} · Overview</h2>
                        <span className="weather-chip" style={{ background: '#F1F5F9', padding: '6px 14px', borderRadius: '40px', fontSize: '14px', fontWeight: 500 }}>{day.weatherInfo || "☀️ Clear Sky"}</span>
                    </div>
                    
                    {day.events?.map((ev: any, eIndex: number) => {
                        if (ev.type === 'transport') {
                            return (
                                <div className="transport-row" key={ev.id || eIndex} style={{ padding: '16px 0', marginLeft: '38px', color: '#64748B', borderBottom: '1px dashed #E2E8F0' }}>
                                    🚗 {ev.description || "Transport"} · ₹{ev.estimatedCost}
                                </div>
                            );
                        } else {
                            return (
                                <div className="activity-item" key={ev.id || eIndex} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 0', borderBottom: '1px solid #F1F5F9' }}>
                                    <span className="activity-time" style={{ fontWeight: 600, color: '#2563EB', minWidth: '80px' }}>{ev.time || "00:00"}</span>
                                    <div className="activity-info" style={{ flex: 1 }}>
                                        <span className="activity-name" style={{ fontWeight: 600, fontSize: '18px' }}>{ev.title}</span>
                                        <span className="activity-desc" style={{ fontSize: '14px', color: '#64748B' }}> · {ev.durationMinutes} mins · {ev.description}</span>
                                    </div>
                                    <span className="activity-cost" style={{ fontWeight: 500, color: '#0F766E', marginLeft: '12px' }}>₹{ev.estimatedCost}</span>
                                </div>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    );
};

export default SharedItinerary;
