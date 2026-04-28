import React, { useEffect } from 'react';

const Cancellation: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Cancellation Options</h1>
                    <p>Flexibility when plans change.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <h2>Seamless Adjustments</h2>
                        <p>
                            Life happens — and Roamly is built for it. Whether you need to reschedule a day trip, swap destinations, or cancel entirely, our system makes it effortless. Since Roamly generates AI-powered plans (not bookings), you can regenerate or modify your itinerary at any time with zero penalties.
                        </p>
                    </div>

                    <div className="content-block">
                        <h2>Roamly Premium Cancellations</h2>
                        <p>For users who book through our partner integrations, the following policies apply:</p>
                        <ul className="info-list">
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>24-Hour Grace Period</strong>
                                    <p>Cancel any partner booking within 24 hours of confirmation for a full refund, no questions asked.</p>
                                </div>
                            </li>
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>Instant Re-booking</strong>
                                    <p>Changed your mind? Swap your booking to a different date or destination instantly. Our AI will adjust the rest of your itinerary to match.</p>
                                </div>
                            </li>
                            <li>
                                <span className="info-list-icon">✦</span>
                                <div>
                                    <strong>Partner Policies</strong>
                                    <p>Individual cancellation terms may vary by hotel, airline, or activity provider. Full details are shown before you confirm any booking.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="content-block">
                        <h2>App Subscription</h2>
                        <p>
                            You can cancel your Roamly Pro subscription at any time from your account settings. Your premium features will remain active until the end of your current billing cycle. No hidden fees, no hassle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cancellation;
