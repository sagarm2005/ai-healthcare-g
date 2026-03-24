import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ConversationList = ({ setSelectedContact, refreshConversations, setRefreshConversations }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [availableContacts, setAvailableContacts] = useState({ doctors: [], admins: [], patients: [] });

    useEffect(() => {
        const fetchConversationsAndContacts = async () => {
            try {
                const [convRes, contactRes] = await Promise.all([
                    api.get('/messages/conversations/list'),
                    api.get('/messages/contacts/available')
                ]);
                setConversations(convRes.data);
                setAvailableContacts(contactRes.data);
            } catch (err) {
                console.error('Error fetching conversations or contacts:', err);
            }
        };

        fetchConversationsAndContacts();
    }, [refreshConversations]);

    return (
        <div className="conversation-sidebar">
            <div className="conversation-list-header">Chats</div>
            <div className="conversation-list">
                {conversations.length === 0 && <p className="p-4 text-gray-500">No conversations yet.</p>}
                {conversations.map(conv => (
                    <div 
                        key={conv._id} 
                        className="conversation-item"
                        onClick={() => setSelectedContact(conv)}
                    >
                        <div className="conversation-info">
                            <div className="conversation-name">{conv.profileId?.name || conv.email}</div>
                            <div className="conversation-preview">{conv.role}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="conversation-list-header">Start New Chat</div>
            <div className="conversation-list">
                {user.role !== 'Doctor' && availableContacts.doctors.map(contact => (
                    <div 
                        key={contact._id} 
                        className="conversation-item"
                        onClick={() => setSelectedContact(contact)}
                    >
                        <div className="conversation-info">
                            <div className="conversation-name">{contact.profileId?.name || contact.email}</div>
                            <div className="conversation-preview">Doctor</div>
                        </div>
                    </div>
                ))}
                {user.role !== 'Admin' && availableContacts.admins.map(contact => (
                    <div 
                        key={contact._id} 
                        className="conversation-item"
                        onClick={() => setSelectedContact(contact)}
                    >
                        <div className="conversation-info">
                            <div className="conversation-name">{contact.profileId?.name || contact.email}</div>
                            <div className="conversation-preview">Admin</div>
                        </div>
                    </div>
                ))}
                {user.role !== 'Patient' && availableContacts.patients.map(contact => (
                    <div 
                        key={contact._id} 
                        className="conversation-item"
                        onClick={() => setSelectedContact(contact)}
                    >
                        <div className="conversation-info">
                            <div className="conversation-name">{contact.profileId?.name || contact.email}</div>
                            <div className="conversation-preview">Patient</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConversationList;
