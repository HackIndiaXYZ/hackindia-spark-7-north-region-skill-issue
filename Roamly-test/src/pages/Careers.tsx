import React, { useEffect } from 'react';

const Careers: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const positions = [
        {
            title: "Senior AI Engineer",
            type: "Full-time · Remote",
            description: "Design and optimize our Gemini-powered itinerary engine. Build intelligent models that understand traveler intent, weather patterns, and cultural events to generate world-class travel plans.",
            color: "#E63946"
        },
        {
            title: "Frontend UX Developer",
            type: "Full-time · Hybrid (Bangalore)",
            description: "Craft beautiful, performant interfaces using React, TypeScript, and modern CSS. You'll own the entire user experience — from the landing page to the interactive journey map.",
            color: "#FF6B35"
        },
        {
            title: "Product Manager — Mobile",
            type: "Full-time · Remote",
            description: "Lead the mobile product strategy for Roamly's upcoming iOS and Android apps. Define the roadmap, collaborate with engineering, and ensure we deliver a premium mobile travel experience.",
            color: "#3498DB"
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Careers at Roamly</h1>
                    <p>Join us in building the future of travel.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <h2>Shape the World's Adventures</h2>
                        <p>
                            We're a small, passionate team of engineers, designers, and travelers on a mission to make trip planning effortless. At Roamly, you'll work with cutting-edge AI, ship real products, and directly impact how millions of people explore the world.
                        </p>
                    </div>

                    <div className="content-block">
                        <h3>Open Positions</h3>
                        <div className="job-listings">
                            {positions.map((job, i) => (
                                <div className="job-card" key={i} style={{ borderLeftColor: job.color }}>
                                    <div className="job-header">
                                        <h4>{job.title}</h4>
                                        <span className="job-type">{job.type}</span>
                                    </div>
                                    <p>{job.description}</p>
                                    <button className="btn-primary" style={{ marginTop: '1.25rem', fontSize: '0.8rem', padding: '0.7rem 1.5rem' }}>
                                        Apply Now →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;
