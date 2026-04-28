import React, { useEffect } from 'react';

const Press: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Press & Media</h1>
                    <p>Roamly in the news.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <h2>Media Resources</h2>
                        <p>
                            For press inquiries, interview requests, or media partnerships, reach out to our communications team at <span className="accent-text">press@roamly.test</span>. We typically respond within 24 hours on business days.
                        </p>
                    </div>

                    <div className="content-block">
                        <h2>Brand Guidelines</h2>
                        <p>
                            Access our official logos, color palettes, typography, and usage guidelines for consistent brand representation across all media channels.
                        </p>
                        <button className="btn-primary" style={{ marginTop: '1.5rem' }}>
                            Download Brand Kit
                        </button>
                    </div>

                    <div className="content-block">
                        <h3>Recent Coverage</h3>
                        <div className="press-list">
                            <div className="press-item">
                                <div className="press-source">TechCrunch</div>
                                <div className="press-detail">
                                    <p>"Roamly's AI-first approach to travel planning is a glimpse into the future of the industry."</p>
                                    <span className="press-date">January 2026</span>
                                </div>
                            </div>
                            <div className="press-item">
                                <div className="press-source">Travel + Leisure</div>
                                <div className="press-detail">
                                    <p>"One of the most innovative travel tools we've seen this year — smart, beautiful, and genuinely useful."</p>
                                    <span className="press-date">December 2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Press;
