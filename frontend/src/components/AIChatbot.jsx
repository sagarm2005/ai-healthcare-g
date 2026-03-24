import React, { useState, useEffect, useRef } from 'react';
import './AIChatbot.css';
import api from '../services/api';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Smart Doctor Assistant. Describe your symptoms, and I'll suggest possible causes and medicine.", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        const userMessage = { text: userText, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { message: userText });
            setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.", 
                isBot: true 
            }]);
        } finally {
            setIsLoading(false);
            // Refocus input after loading finishes
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        }
    };

    return (
        <div className="ai-chatbot-container">
            {/* Floating Button */}
            <button 
                className={`ai-chatbot-toggle ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : 'Ai'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chatbot-window">
                    <div className="ai-chatbot-header">
                        <h3>Smart Doctor Assistant</h3>
                        <p>AI Powered Symptom Analysis</p>
                    </div>
                    <div className="ai-chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="message-content">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-content">
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="ai-chatbot-input" onSubmit={handleSendMessage}>
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Type your symptoms..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputValue.trim()}>
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
