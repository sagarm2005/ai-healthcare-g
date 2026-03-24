import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import './ChatDropdown.css';

const ChatDropdown = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'chat', or 'compose-both'
    const [conversations, setConversations] = useState([]);
    const [availableContacts, setAvailableContacts] = useState({ doctors: [], admins: [], patients: [] });
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, view]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (isOpen && user) {
                try {
                    const [convRes, contactRes] = await Promise.all([
                        api.get('/messages/conversations/list'),
                        api.get('/messages/contacts/available')
                    ]);
                    setConversations(convRes.data);
                    setAvailableContacts(contactRes.data);
                    
                    if (contactRes.data.doctors && contactRes.data.doctors.length > 0) setSelectedDoctor(contactRes.data.doctors[0]._id);
                    if (contactRes.data.admins && contactRes.data.admins.length > 0) setSelectedAdmin(contactRes.data.admins[0]._id);
                } catch (err) {
                    console.error('Error fetching chat data:', err);
                }
            }
        };
        fetchInitialData();
    }, [isOpen, user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/messages/${userId}`);
            setMessages(res.data);
            
            // Automatically mark unread messages from this contact as read
            const unreadIds = res.data
                .filter(msg => msg.sender === userId && !msg.isRead)
                .map(msg => msg._id);
            
            if (unreadIds.length > 0) {
                await Promise.all(unreadIds.map(id => api.put(`/messages/${id}/read`)));
                // Update local messages state
                setMessages(prev => prev.map(msg => 
                    unreadIds.includes(msg._id) ? { ...msg, isRead: true } : msg
                ));
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        fetchMessages(contact._id);
        setView('chat');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await api.post('/messages', {
                receiverId: selectedContact._id,
                content: newMessage
            });
            setMessages(prevMessages => [...prevMessages, res.data]);
            setNewMessage('');
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const handleSendBoth = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedDoctor || !selectedAdmin) {
            toast.error('Please select both recipients and enter a message');
            return;
        }

        try {
            await Promise.all([
                api.post('/messages', { receiverId: selectedDoctor, content: newMessage }),
                api.post('/messages', { receiverId: selectedAdmin, content: newMessage })
            ]);
            toast.success('Message sent to both doctor and admin');
            setNewMessage('');
            setView('list');
            // Refresh conversations
            const convRes = await api.get('/messages/conversations/list');
            setConversations(convRes.data);
        } catch (err) {
            toast.error('Failed to send message to one or more recipients');
        }
    };

    if (!user) {
        console.log('ChatDropdown: No user found in context');
        return null;
    }

    console.log('ChatDropdown rendering for user:', user.email, 'role:', user.role);

    return (
        <div className="chat-dropdown-container" ref={dropdownRef}>
            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="chat-dropdown-menu">
                    <div className="chat-header">
                        {(view === 'chat' || view === 'compose-both') && (
                            <button className="back-btn" onClick={() => setView('list')}>
                                &larr;
                            </button>
                        )}
                        <h3>
                            {view === 'list' ? 'Messages' : 
                             view === 'compose-both' ? 'Message Both' :
                             selectedContact?.profileId?.name || selectedContact?.email}
                        </h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>

                    <div className="chat-body">
                        {view === 'list' ? (
                            <div className="conversation-list">
                                {user.role === 'Patient' && availableContacts.doctors.length > 0 && availableContacts.admins.length > 0 && (
                                    <button 
                                        className="message-both-trigger"
                                        onClick={() => setView('compose-both')}
                                    >
                                        + Message Doctor & Admin
                                    </button>
                                )}

                                <div className="section-title">Your Conversations</div>
                                {conversations.length === 0 && <p className="empty-msg">No messages yet.</p>}
                                {conversations.map(conv => (
                                    <div key={conv._id} className="contact-item" onClick={() => handleSelectContact(conv)}>
                                        <div className="contact-info">
                                            <span className="contact-name">{conv.profileId?.name || conv.email}</span>
                                            <span className="contact-role">{conv.role}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="section-title">New Message</div>
                                {availableContacts.doctors && availableContacts.doctors.length > 0 && (
                                    <div className="contact-group">
                                        <h4>Doctors</h4>
                                        {availableContacts.doctors.map(doctor => (
                                            <div key={doctor._id} className="contact-item" onClick={() => handleSelectContact(doctor)}>
                                                {doctor.profileId?.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {availableContacts.admins && availableContacts.admins.length > 0 && (
                                    <div className="contact-group">
                                        <h4>Admins</h4>
                                        {availableContacts.admins.map(admin => (
                                            <div key={admin._id} className="contact-item" onClick={() => handleSelectContact(admin)}>
                                                {admin.profileId?.name || admin.email}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {availableContacts.patients && availableContacts.patients.length > 0 && (
                                    <div className="contact-group">
                                        <h4>Patients</h4>
                                        {availableContacts.patients.map(patient => (
                                            <div key={patient._id} className="contact-item" onClick={() => handleSelectContact(patient)}>
                                                {patient.profileId?.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : view === 'compose-both' ? (
                            <div className="compose-both-window">
                                <div className="compose-form-group">
                                    <label>Select Doctor:</label>
                                    <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                                        {availableContacts.doctors.map(d => (
                                            <option key={d._id} value={d._id}>{d.profileId?.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="compose-form-group">
                                    <label>Select Admin:</label>
                                    <select value={selectedAdmin} onChange={(e) => setSelectedAdmin(e.target.value)}>
                                        {availableContacts.admins.map(a => (
                                            <option key={a._id} value={a._id}>{a.profileId?.name || a.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="messages-container">
                                    <textarea
                                        placeholder="Type your message to both..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="both-message-input"
                                    />
                                </div>
                                <div className="message-form">
                                    <button type="button" onClick={handleSendBoth} className="send-both-btn">
                                        Send to Both
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="chat-window">
                                <div className="messages-container">
                                    {messages.map((msg, i) => (
                                        <div key={msg._id || i} className={`message-bubble ${msg.sender === user._id ? 'sent' : 'received'}`}>
                                            <p>{msg.content}</p>
                                            <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form className="message-form" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit">Send</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatDropdown;
