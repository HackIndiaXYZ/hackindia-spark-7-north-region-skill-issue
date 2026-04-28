import React, { useState } from 'react';

interface NearMeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NearMeModal: React.FC<NearMeModalProps> = ({ isOpen, onClose }) => {
    const [isLocating, setIsLocating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [nearMeData, setNearMeData] = useState<any>(null);

    // If modal is unmounted or closed early, we reset states underneath
    React.useEffect(() => {
        if (isOpen && !nearMeData && !isLocating && !errorMsg) {
            startLocationSearch();
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsLocating(false);
        setErrorMsg('');
        setNearMeData(null);
        onClose();
    };

    const startLocationSearch = () => {
        setIsLocating(true);
        setErrorMsg('');

        if (!navigator.geolocation) {
            setErrorMsg("Geolocation is completely disabled or unsupported in this browser.");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch('http://localhost:8080/api/near-me', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat: latitude, lng: longitude })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        setNearMeData(data);
                    } else {
                        setErrorMsg("AI Generation Error: " + (data.error || "Failed to parse boundary."));
                    }
                } catch (err) {
                    setErrorMsg("Network Error: Could not reach Roamly Cloud at http://localhost:8080.");
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                let msg = "";
                switch(err.code) {
                    case err.PERMISSION_DENIED: msg = "You denied the request for Geolocation."; break;
                    case err.POSITION_UNAVAILABLE: msg = "Location information is completely unavailable."; break;
                    case err.TIMEOUT: msg = "The request to get user location timed out."; break;
                    default: msg = "An unknown tracking error occurred."; break;
                }
                setErrorMsg(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="nearme-modal-overlay" onClick={handleClose}>
            <div className="nearme-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Top accent line */}
                <div className="nearme-modal-accent"></div>

                <button onClick={handleClose} className="nearme-modal-close">
                    &times;
                </button>

                <div className="nearme-modal-body">

                    {/* Error State */}
                    {errorMsg && (
                        <div className="nearme-state-error">
                            <div className="nearme-error-icon">⚠️</div>
                            <h3>Location Rejected</h3>
                            <p>{errorMsg}</p>
                            <button onClick={startLocationSearch} className="btn-primary nearme-retry-btn">Try Again</button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLocating && !errorMsg && (
                        <div className="nearme-state-loading">
                            <div className="nearme-radar">
                                <div className="nearme-radar-ring"></div>
                                <div className="nearme-radar-ring nearme-radar-ring-2"></div>
                                <div className="nearme-radar-dot"></div>
                            </div>
                            <h3>Locating you...</h3>
                            <p>Discovering the best spots, hidden gems, and local favourites around you.</p>
                            <div className="progress-slide-track">
                                <div className="progress-slide-fill"></div>
                            </div>
                        </div>
                    )}

                    {/* Results State */}
                    {nearMeData && !isLocating && !errorMsg && (
                        <div className="nearme-results">
                            {/* Header */}
                            <div className="nearme-results-header">
                                <span className="nearme-live-tag">📍 Live Local Guide</span>
                                <h2>Surrounding <span className="nearme-location-name">{nearMeData.detectedLocation}</span></h2>
                                <p>We mapped your exact coordinates. Here is what is explicitly around you right now.</p>
                            </div>

                            {/* Cafes Section */}
                            <div className="nearme-section">
                                <h3 className="nearme-section-title">
                                    <span className="nearme-section-icon">☕</span>
                                    Best Rated Cafes
                                </h3>
                                <div className="nearme-cards-grid">
                                    {nearMeData.cafes?.map((cafe: any, i: number) => (
                                        <div key={i} className="nearme-card">
                                            <div className="nearme-card-accent"></div>
                                            <h4>{cafe.name}</h4>
                                            <p>{cafe.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fun Places Section */}
                            <div className="nearme-section">
                                <h3 className="nearme-section-title">
                                    <span className="nearme-section-icon">🗺️</span>
                                    Hidden Gems &amp; Fun Spots
                                </h3>
                                <div className="nearme-cards-grid">
                                    {nearMeData.funPlaces?.map((spot: any, i: number) => (
                                        <div key={i} className="nearme-card">
                                            <div className="nearme-card-accent"></div>
                                            <h4>{spot.name}</h4>
                                            <p>{spot.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearMeModal;
