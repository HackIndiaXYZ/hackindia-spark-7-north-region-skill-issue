import React, { useEffect, useState } from 'react';

const HelpCenter: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "How does the AI dynamic replanning work?",
            answer: "When conditions change — weather, closures, or personal preference — simply tap the 'Re-plan' button on any event in your itinerary. Our Gemini-powered AI instantly generates a new alternative that fits your budget, vibe, and schedule while keeping the rest of your trip intact."
        },
        {
            question: "Is Roamly free to use?",
            answer: "Yes! Roamly's core planning features are completely free. You can generate unlimited itineraries, share them with friends, and access real-time weather data at no cost. Roamly Pro unlocks premium features like offline access, priority AI processing, and exclusive partner discounts."
        },
        {
            question: "Can I export my itinerary?",
            answer: "Absolutely. You can share your itinerary via a unique public link that anyone can view without logging in. We're also working on PDF export and calendar integration for upcoming releases."
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Help Center</h1>
                    <p>We're here to help you navigate your journey.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="content-block">
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Search for help articles..."
                        />
                    </div>

                    <div className="content-block">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            {faqs.map((faq, i) => (
                                <div
                                    className={`faq-box ${openFaq === i ? 'active' : ''}`}
                                    key={i}
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <div className="faq-question">
                                        <h4>{faq.question}</h4>
                                        <span className="faq-toggle">{openFaq === i ? '−' : '+'}</span>
                                    </div>
                                    {openFaq === i && (
                                        <div className="faq-answer">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="content-block" style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <p>Still need help? Reach out to us at <span className="accent-text">support@roamly.test</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
