import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../../pages/style/Chat.css'; // Import the shared chat styles

const ChatLayout = () => {
    const { user } = useAuth();
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [refreshConversations, setRefreshConversations] = useState(false);

    useEffect(() => {
        if (selectedContact) {
            const fetchChatMessages = async () => {
                try {
                    // Fetch messages for the selected contact
                    const res = await api.get(`/messages/${selectedContact._id}`);
                    setMessages(res.data);
                } catch (err) {
                    toast.error('Failed to load messages.');
                    console.error('Error fetching messages:', err);
                }
            };
            fetchChatMessages();
        } else {
            setMessages([]); // Clear messages if no contact is selected
        }
    }, [selectedContact, refreshConversations]);

    const handleDeleteAllMessages = async () => {
        if (window.confirm('Are you sure you want to delete ALL your messages? This action cannot be undone.')) {
            try {
                await api.delete('/messages/all');
                toast.success('All messages deleted.');
                setRefreshConversations(prev => !prev); // Trigger re-fetch of conversations and messages
            } catch (err) {
                toast.error('Failed to delete all messages.');
                console.error('Error deleting all messages:', err);
            }
        }
    };

    return (
        <div className="chat-layout">
            <ConversationList 
                setSelectedContact={setSelectedContact} 
                refreshConversations={refreshConversations}
                setRefreshConversations={setRefreshConversations}
            />
            <ChatWindow 
                selectedContact={selectedContact} 
                messages={messages} 
                setMessages={setMessages}
            />
        </div>
    );
};

export default ChatLayout;
