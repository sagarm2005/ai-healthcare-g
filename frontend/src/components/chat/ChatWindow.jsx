import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ selectedContact, fetchMessages, messages, setMessages }) => {
    const { user } = useAuth();
    const [newMessageContent, setNewMessageContent] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessageContent.trim()) {
            return;
        }

        try {
            const res = await api.post('/messages', {
                receiverId: selectedContact._id,
                content: newMessageContent
            });
            setMessages(prevMessages => [...prevMessages, res.data]);
            setNewMessageContent('');
        } catch (err) {
            toast.error('Failed to send message.');
            console.error('Error sending message:', err);
        }
    };

    if (!selectedContact) {
        return (
            <div className="chat-window-container">
                <div className="chat-window-header">Select a conversation to start chatting</div>
                <div className="messages-container">
                    <p className="text-center text-gray-500">Your messages will appear here.</p>
                </div>
            </div>
        );
    }

    // Filter messages to only show those relevant to the current chat
    const conversationMessages = messages.filter(
        msg => (msg.sender === user._id && msg.receiver === selectedContact._id) ||
               (msg.sender === selectedContact._id && msg.receiver === user._id)
    );

    return (
        <div className="chat-window-container">
            <div className="chat-window-header">
                {selectedContact.profileId?.name || selectedContact.email}
            </div>
            <div className="messages-container">
                {conversationMessages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet. Say hello!</p>
                ) : (
                    conversationMessages.map(msg => (
                        <MessageBubble 
                            key={msg._id} 
                            message={msg} 
                            isCurrentUserSender={msg.sender === user._id} 
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;