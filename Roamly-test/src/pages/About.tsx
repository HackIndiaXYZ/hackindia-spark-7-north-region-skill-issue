import React, { useEffect } from 'react';

const About: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>About Us</h1>
                    <p>Redefining how you roam.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <h2>Our Mission</h2>
                        <p>
                            To make travel planning effortless, intelligent, and deeply personal. We believe that the best trips aren't over-planned — they're smartly planned. Roamly exists to take the stress out of logistics so you can focus on what matters: the experience.
                        </p>
                    </div>

                    <div className="content-block">
                        <h2>The Roamly Story</h2>
                        <p>
                            Roamly started as a weekend hack between friends who were tired of spending hours on spreadsheets every time a trip came up. We asked a simple question: <em>"What if AI could plan an entire trip in 30 seconds — and actually get it right?"</em>
                        </p>
                        <p>
                            That question became an obsession. We built an engine powered by Google's Gemini AI, integrated real-time weather data, Google Places intelligence, and transport logistics — then wrapped it in an interface that feels premium, fast, and fun to use. Today, Roamly has planned thousands of trips across India and beyond.
                        </p>
                    </div>

                    <div className="content-block">
                        <h2>Why Choose Us?</h2>
                        <p>
                            Unlike generic template-based planners, Roamly is your <span className="accent-text">personal travel concierge</span>. Every itinerary is generated fresh — tailored to your budget, dates, vibe, and real-world conditions. No two plans are alike. And if something doesn't feel right, you can re-plan any event on the fly with a single click.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
