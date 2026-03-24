import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Terms.css';

const Terms = () => {
    return (
        <div className="terms-container">
            <h1>Terms & Conditions</h1>
            <p>Welcome to our AI Healthcare platform. By using our services, you agree to the following terms and conditions:</p>

            <h2>1. Accuracy of Information</h2>
            <p>The health insights provided by our AI tools are for informational purposes only. While we strive for high accuracy, these suggestions are not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare provider for personal medical advice.</p>

            <h2>2. User Responsibility & Data Privacy</h2>
            <p>You agree to provide accurate personal and medical information. In return, we are committed to protecting your privacy; your data is encrypted and handled in strict accordance with our Privacy Policy and applicable healthcare data protection laws.</p>

            <h2>3. Service Usage & Availability</h2>
            <p>Our platform facilitates connections between patients and doctors and provides AI-driven analysis. We strive for 24/7 availability but do not guarantee uninterrupted access. We reserve the right to update these terms or platform features at any time to improve service quality.</p>

            <Link to="/register" className="back-button">Back to Registration</Link>
        </div>
    );
};

export default Terms;
