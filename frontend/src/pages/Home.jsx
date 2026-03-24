import React from 'react';
import { Link } from 'react-router-dom';
import './style/Home.css';

const Home = () => {
    const hospitalFeatures = [
        {
            title: "Advanced AI Diagnostics",
            description: "Leveraging cutting-edge artificial intelligence to provide accurate and rapid medical diagnoses.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=60",
        },
        {
            title: "Expert Medical Professionals",
            description: "Our team of world-class doctors and specialists are dedicated to providing the best patient care.",
            image: "https://tse1.mm.bing.net/th/id/OIP.vMCMUtCaau6z7qnDHaaR8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
        },
        {
            title: "Modern Infrastructure",
            description: "Equipped with the latest medical technology and facilities for comprehensive healthcare.",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=60",
        },
        {
            title: "Patient-Centric Approach",
            description: "Personalized care plans tailored to individual needs, ensuring comfort and effective recovery.",
            image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=500&q=60",
        }
    ];

    return (
        <div id="top" className="home-container">
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">Innovative Healthcare Solutions</h1>
                        <p className="hero-subtitle">Combining Technology and Compassion for a Healthier Future</p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn-primary-home">Get Started</Link>
                            <Link to="/login" className="btn-secondary-home">Learn More</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div id="services" className="features-section">
                <h2 className="section-title">Our Specialized Services</h2>
                <div className="cards-container">
                    {hospitalFeatures.map((feature, index) => (
                        <div key={index} className="feature-card nano-banana-card">
                            <div className="card-image-wrapper">
                                <img src={feature.image} alt={feature.title} className="card-image" />
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{feature.title}</h3>
                                <p className="card-description">{feature.description}</p>
                                <button className="card-btn">Explore</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div id="about" className="features-section bg-gray-50">
                <h2 className="section-title">About Us</h2>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-gray-600 text-lg mb-8">
                        We are at the forefront of healthcare innovation, combining advanced AI technology with human expertise 
                        to provide the best possible medical outcomes for our patients. Our mission is to make high-quality 
                        healthcare accessible and efficient for everyone.
                    </p>
                </div>
            </div>

            <div id="contact" className="features-section">
                <h2 className="section-title">Contact Us</h2>
                <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8">
                    <div className="text-left">
                        <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
                        <p className="text-gray-600 mb-2">Email: info@ai-healthcare.com</p>
                        <p className="text-gray-600 mb-2">Phone: +1 (555) 123-4567</p>
                        <p className="text-gray-600 mb-2">Address: 123 Health Ave, Innovation City, IC 54321</p>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold mb-4">Hours</h3>
                        <p className="text-gray-600 mb-2">Monday - Friday: 8:00 AM - 8:00 PM</p>
                        <p className="text-gray-600 mb-2">Saturday: 9:00 AM - 5:00 PM</p>
                        <p className="text-gray-600">Sunday: Closed (Emergency 24/7)</p>
                    </div>
                </div>
            </div>

            <footer className="home-footer">
                <p>&copy; 2026 AI Healthcare Sector. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
