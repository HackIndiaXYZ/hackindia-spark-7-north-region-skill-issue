import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const posts = [
        {
            title: "10 Hidden Gems in Rajasthan",
            excerpt: "Beyond the forts and palaces — discover the secret villages, desert camps, and artisan workshops that most tourists never see.",
            date: "March 28, 2026",
            tag: "Destinations"
        },
        {
            title: "How AI is Changing Travel",
            excerpt: "From dynamic replanning to real-time weather integration, here's how artificial intelligence is transforming the way we explore the world.",
            date: "March 15, 2026",
            tag: "Technology"
        },
        {
            title: "Traveling on a Budget?",
            excerpt: "Our complete guide to seeing India on ₹2,000/day — including accommodation, food, transport, and experiences. Yes, it's possible.",
            date: "February 22, 2026",
            tag: "Guides"
        },
        {
            title: "The Perfect Goa Itinerary",
            excerpt: "5 days, both coasts, local food, hidden beaches, and zero stress. This Roamly-generated plan has already been used by 4,000+ travelers.",
            date: "February 10, 2026",
            tag: "Itineraries"
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Roamly Blog</h1>
                    <p>Insights, guides, and stories from the road.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    <div className="blog-grid">
                        {posts.map((post, i) => (
                            <div className="blog-card" key={i}>
                                <div className="blog-card-tag">{post.tag}</div>
                                <h3>{post.title}</h3>
                                <p>{post.excerpt}</p>
                                <div className="blog-card-footer">
                                    <span className="blog-date">{post.date}</span>
                                    <Link to="/blog" className="blog-readmore">Read more →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;
