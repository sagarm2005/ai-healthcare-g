import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../../pages/style/global.css'; // Assuming global styles are here

const MedicineSuggestion = () => {
    const [symptoms, setSymptoms] = useState('');
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const resultRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) {
            toast.error('Please enter your symptoms');
            return;
        }

        setLoading(true);
        setSuggestion(null);

        try {
            const { data } = await api.post('/ai/chat', { message: symptoms });
            setSuggestion(data.reply);
            // Scroll to result after a short delay to allow rendering
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Error getting medicine suggestion:', error);
            toast.error(error.response?.data?.message || 'Failed to get suggestion. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to format the AI response (basic markdown-like formatting)
    const formatResponse = (text) => {
        if (!text) return null;
        
        return text.split('\n').map((line, index) => {
            if (line.startsWith('Possible Condition:')) {
                return <h3 key={index} className="text-xl font-bold text-indigo-700 mt-4 mb-2">{line}</h3>;
            } else if (line.startsWith('Suggested Medicine:') || line.startsWith('Basic Precautions:') || line.startsWith('Doctor Consultation Advice:')) {
                return <h4 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line}</h4>;
            } else if (line.startsWith('- ')) {
                return <li key={index} className="ml-6 list-disc text-gray-700 mb-1">{line.substring(2)}</li>;
            } else if (line.startsWith('DISCLAIMER:')) {
                return <p key={index} className="text-sm italic text-red-600 mt-6 border-t pt-4">{line}</p>;
            } else if (line.trim() === '') {
                return <br key={index} />;
            } else {
                return <p key={index} className="text-gray-700 mb-2">{line}</p>;
            }
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white">AI Medicine Suggestion System</h2>
                        <p className="text-indigo-100">Describe your symptoms and get instant AI-powered advice</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-4">
                            <label htmlFor="symptoms" className="block text-gray-700 font-semibold mb-2">
                                How are you feeling? (Enter your symptoms)
                            </label>
                            <textarea
                                id="symptoms"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none"
                                placeholder="e.g., I have a headache and a mild fever since yesterday..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                disabled={loading}
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing Symptoms...
                                    </>
                                ) : 'Get AI Suggestion'}
                            </button>
                        </div>
                    </form>
                </div>

                {suggestion && (
                    <div ref={resultRef} className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-indigo-500 animate-fadeIn">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">AI Health Assessment</h3>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                {formatResponse(suggestion)}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-8 bg-blue-50 p-4 rounded-lg flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <h5 className="font-bold text-blue-800">How it works</h5>
                        <p className="text-blue-700 text-sm">Our AI analyzes your symptoms against a medical database to provide general guidance. This is not a substitute for professional medical advice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineSuggestion;
