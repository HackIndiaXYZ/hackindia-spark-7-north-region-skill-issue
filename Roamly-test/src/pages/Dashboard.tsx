import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, deleteTrip, updateTripStatus, refreshTripStatuses, computeStatus } from '../services/tripStorage';
import type { SavedTrip } from '../services/tripStorage';

const budgetPct = (trip: SavedTrip) =>
    Math.min(100, Math.round((trip.totalEstimatedCost / (Number(trip.budget) || 1)) * 100));

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<SavedTrip[]>([]);
    const [quickDest, setQuickDest] = useState('');

    const reload = () => {
        refreshTripStatuses();
        setTrips(getTrips());
    };

    useEffect(() => { reload(); }, []);

    const upcoming  = trips.filter(t => t.status === 'upcoming');
    const ongoing   = trips.filter(t => t.status === 'ongoing');
    const completed = trips.filter(t => t.status === 'completed');
    const cancelled = trips.filter(t => t.status === 'cancelled');

    const totalTrips  = trips.filter(t => t.status !== 'cancelled').length;
    const uniqueDests = new Set(trips.filter(t => t.status !== 'cancelled').map(t => t.destination)).size;

    const handleDelete = (planId: string) => { deleteTrip(planId); reload(); };

    const handleEnd = (planId: string) => { updateTripStatus(planId, 'completed'); reload(); };

    const handleCancel = (planId: string) => { updateTripStatus(planId, 'cancelled'); reload(); };

    const handleRestore = (trip: SavedTrip) => {
        // Temporarily un-cancel so computeStatus can work on the dates
        updateTripStatus(trip.planId, 'upcoming');
        const restored = computeStatus({ ...trip, status: 'upcoming' });
        updateTripStatus(trip.planId, restored);
        reload();
    };

    const TripCard = ({
        trip,
        showProgress = true,
        badge,
        actions,
    }: {
        trip: SavedTrip;
        showProgress?: boolean;
        badge?: string;
        actions: React.ReactNode;
    }) => (
        <div className="trip-card">
            <div className="trip-info">
                <h3>
                    {trip.destination}
                    {badge && <span className="status-badge" style={{ marginLeft: '8px' }}>{badge}</span>}
                </h3>
                <div className="trip-meta">
                    {trip.origin && <span>📍 {trip.origin} → {trip.destination}</span>}
                    {trip.startDate && (
                        <span>📅 {trip.startDate}{trip.endDate ? ` – ${trip.endDate}` : ''}</span>
                    )}
                    {trip.travelers && <span>👥 {trip.travelers}</span>}
                </div>
            </div>
            {showProgress && trip.budget && (
                <div className="trip-progress">
                    <span style={{ fontSize: '13px' }}>
                        Budget: ₹{trip.totalEstimatedCost.toLocaleString()} / ₹{Number(trip.budget).toLocaleString()}
                    </span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${budgetPct(trip)}%` }}></div>
                    </div>
                </div>
            )}
            <div className="trip-actions">{actions}</div>
        </div>
    );

    return (
        <React.Fragment>
            <h1 style={{ fontSize: '44px', margin: '10px 0 5px' }}>
                Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: '#64748B', marginBottom: '10px' }}>
                Track your trips, stats, and community inspiration across India.
            </p>

            <div className="dashboard-grid">
                {/* LEFT MAIN PANEL */}
                <div className="main-panel">
                    <div className="welcome-card">
                        <div>
                            <h2 style={{ fontSize: '28px' }}>Welcome back, Traveler! 👋</h2>
                            <p style={{ color: '#64748B' }}>
                                You have {upcoming.length} upcoming adventure{upcoming.length !== 1 ? 's' : ''}.
                            </p>
                        </div>
                        <div className="stats-mini">
                            <div className="stat-item">
                                <span className="stat-number">{totalTrips}</span><br />
                                <span style={{ color: '#64748B' }}>Trips</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{uniqueDests}</span><br />
                                <span style={{ color: '#64748B' }}>Destinations</span>
                            </div>
                        </div>
                    </div>

                    {/* UPCOMING */}
                    <div>
                        <div className="section-header">
                            <h2>📅 Upcoming Trips</h2>
                            <Link to="/planner" className="btn-primary" style={{ padding: '10px 24px' }}>+ Plan New</Link>
                        </div>
                        <div className="trips-container">
                            {upcoming.length > 0 ? upcoming.map(t => (
                                <TripCard key={t.planId} trip={t} badge="Confirmed" actions={
                                    <>
                                        <button className="btn-outline" onClick={() => navigate('/planner', { state: { destination: t.destination, viewPlanId: t.planId } })}>View</button>
                                        <button className="btn-outline" onClick={() => navigate('/planner', { state: { destination: t.destination, origin: t.origin } })}>Edit</button>
                                        <button className="btn-outline" style={{ color: '#F59E0B', borderColor: '#F59E0B' }} onClick={() => handleCancel(t.planId)}>Cancel</button>
                                        <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(t.planId)}>Delete</button>
                                    </>
                                } />
                            )) : (
                                <p style={{ color: '#64748B', padding: '20px 0' }}>
                                    No upcoming trips. <Link to="/planner">Plan one now →</Link>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ONGOING */}
                    {ongoing.length > 0 && (
                        <div>
                            <div className="section-header"><h2>🔄 Ongoing</h2></div>
                            <div className="trips-container">
                                {ongoing.map(t => (
                                    <TripCard key={t.planId} trip={t} showProgress={false} badge="In Progress" actions={
                                        <>
                                            <button className="btn-outline" onClick={() => navigate('/planner', { state: { destination: t.destination, viewPlanId: t.planId } })}>Continue</button>
                                            <button className="btn-outline" style={{ color: '#10B981', borderColor: '#10B981' }} onClick={() => handleEnd(t.planId)}>End Trip</button>
                                            <button className="btn-outline" style={{ color: '#F59E0B', borderColor: '#F59E0B' }} onClick={() => handleCancel(t.planId)}>Cancel</button>
                                            <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(t.planId)}>Delete</button>
                                        </>
                                    } />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COMPLETED */}
                    {completed.length > 0 && (
                        <div>
                            <div className="section-header"><h2>✅ Completed</h2></div>
                            <div className="trips-container">
                                {completed.map(t => (
                                    <TripCard key={t.planId} trip={t} showProgress={false} badge="Completed" actions={
                                        <>
                                            <button className="btn-outline" onClick={() => navigate('/planner', { state: { destination: t.destination, viewPlanId: t.planId } })}>Review</button>
                                            <button className="btn-outline" onClick={() => navigate('/planner', { state: { destination: t.destination } })}>Clone</button>
                                            <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(t.planId)}>Delete</button>
                                        </>
                                    } />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CANCELLED */}
                    {cancelled.length > 0 && (
                        <div>
                            <div className="section-header"><h2>🚫 Cancelled</h2></div>
                            <div className="trips-container">
                                {cancelled.map(t => (
                                    <TripCard key={t.planId} trip={t} showProgress={false} badge="Cancelled" actions={
                                        <>
                                            <button className="btn-outline" style={{ color: '#6366F1', borderColor: '#6366F1' }} onClick={() => handleRestore(t)}>Restore</button>
                                            <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(t.planId)}>Delete</button>
                                        </>
                                    } />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE PANEL */}
                <div className="side-panel">
                    <div className="side-card">
                        <h3>📊 Your Travel Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <span style={{ color: '#64748B' }}>Total trips planned</span><br />
                                <span style={{ fontSize: '32px', fontWeight: 700 }}>{totalTrips}</span>
                            </div>
                            <div>
                                <span style={{ color: '#64748B' }}>Unique destinations</span><br />
                                <span style={{ fontSize: '24px', fontWeight: 700 }}>🗺️ {uniqueDests}</span>
                            </div>
                        </div>
                    </div>

                    <div className="side-card plan-quick">
                        <h3>✈️ Plan a quick trip</h3>
                        <input
                            type="text"
                            placeholder="Where to?"
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #E2E8F0', borderRadius: '40px', marginBottom: '12px', boxSizing: 'border-box' }}
                            value={quickDest}
                            onChange={e => setQuickDest(e.target.value)}
                        />
                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/planner', { state: { destination: quickDest } })}
                        >
                            Start planning →
                        </button>
                    </div>

                    <div className="side-card">
                        <h3>👥 Trending Community</h3>
                        <div className="community-item" onClick={() => navigate('/community')}>
                            <div className="avatar">AJ</div>
                            <div><strong>Jaipur 3‑day Cultural</strong><br /><span style={{ fontSize: '13px' }}>by Anjali</span></div>
                        </div>
                        <div className="community-item" onClick={() => navigate('/community')}>
                            <div className="avatar">VK</div>
                            <div><strong>Goa Budget Backpacking</strong><br /><span style={{ fontSize: '13px' }}>by Vikram</span></div>
                        </div>
                        <div className="community-item" onClick={() => navigate('/community')}>
                            <div className="avatar">MP</div>
                            <div><strong>Manali Adventure Week</strong><br /><span style={{ fontSize: '13px' }}>by Meera</span></div>
                        </div>
                        <button className="btn-outline" style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/community')}>
                            Browse all trips →
                        </button>
                    </div>

                    <div className="side-card" style={{ background: '#E6FFFA', borderLeft: '4px solid #10B981' }}>
                        <h3>🛡️ Safety reminder</h3>
                        <p>Emergency: 100 · Ambulance: 108 · Tourist Helpline: 1363</p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Dashboard;
