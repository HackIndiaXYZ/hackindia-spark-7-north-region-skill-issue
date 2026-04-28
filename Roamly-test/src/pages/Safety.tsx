import React, { useEffect } from 'react';

const Safety: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Trust & Safety</h1>
                    <p>Your well-being is our top priority.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <h2>A Safe Way to Roam</h2>
                        <p>
                            Roamly continuously monitors safety advisories, local alerts, and travel warnings to keep you informed at every stage of your journey. Our AI dynamically adjusts your itinerary if conditions change — so you can explore with peace of mind.
                        </p>
                        <ul className="info-list">
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>Verified Locations</strong>
                                    <p>Every destination in our recommendations is sourced from verified, reputable data including Google Places and government tourism boards.</p>
                                </div>
                            </li>
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>Weather Alerts</strong>
                                    <p>Real-time weather monitoring ensures your plans adapt to storms, floods, or extreme heat before they affect your trip.</p>
                                </div>
                            </li>
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>Emergency Contacts</strong>
                                    <p>Every itinerary includes local emergency numbers, nearest hospitals, and embassy contacts relevant to your destination.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="content-block">
                        <h2>Data Privacy</h2>
                        <p>
                            Your data is encrypted end-to-end using industry-standard AES-256 encryption. We never sell your personal information to third parties. Location data is used only during active planning sessions and is never stored permanently. You are always in control of your data — delete your account and all associated data at any time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Safety;
