import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';
import '../style/NotificationsPage.css'; // Reusing patient styles or we can create new ones

const DoctorNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [availableContacts, setAvailableContacts] = useState({ patients: [], admins: [] });
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor-dashboard/notifications', { skipErrorRedirect: true });
            return response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch notifications.';
            setError(message);
            toast.error(message);
            console.error("Error fetching notifications:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get('/messages/contacts/available', { skipErrorRedirect: true });
            setAvailableContacts(res.data);
        } catch (err) {
            console.error('Error fetching contacts:', err);
        }
    };

    const fetchMessageHistory = async () => {
        try {
            const conversationsRes = await api.get('/messages/conversations/list', { skipErrorRedirect: true });
            const conversations = conversationsRes.data;

            const allMessages = [];
            for (const contact of conversations) {
                const messagesRes = await api.get(`/messages/${contact._id}`, { skipErrorRedirect: true });
                const messages = messagesRes.data.map(msg => {
                    const isCurrentUserSender = String(msg.sender) === String(user._id);
                    return {
                        _id: msg._id,
                        itemType: 'message',
                        type: isCurrentUserSender ? 'Doctor Message' : (contact.role === 'Patient' ? 'Patient Message' : 'Admin Message'),
                        message: msg.content,
                        sender: msg.sender,
                        receiver: msg.receiver,
                        senderName: contact.profileId?.name || contact.email,
                        receiverName: isCurrentUserSender ? (contact.profileId?.name || contact.email) : (user.profileId?.name || user.email),
                        createdAt: msg.createdAt,
                        isRead: msg.isRead,
                    };
                });
                allMessages.push(...messages);
            }
            return allMessages;
        } catch (err) {
            console.error('Error fetching message history:', err);
            return [];
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const [notificationsData, messageHistory] = await Promise.all([
                fetchNotifications(),
                fetchMessageHistory()
            ]);

            // Merge notifications and message history
            const allItems = [...notificationsData];
            const existingIds = new Set(notificationsData.map(n => n._id));

            messageHistory.forEach(msg => {
                if (!existingIds.has(msg._id)) {
                    allItems.push(msg);
                }
            });

            // Sort by createdAt
            allItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setNotifications(allItems);
            fetchContacts();
        };

        loadData();
    }, []);

    // Automatically mark all unread notifications as read
    useEffect(() => {
        // Filter for items that are unread and were not sent by the current user
        const unreadItems = notifications.filter(n => !n.isRead && n.sender !== user._id);

        if (unreadItems.length > 0) {
            const markAllAsRead = async () => {
                try {
                    const promises = unreadItems.map(notif =>
                        notif.itemType === 'message'
                            ? api.put(`/messages/${notif._id}/read`, {}, { skipErrorRedirect: true })
                            : api.put(`/doctor-dashboard/notifications/${notif._id}/read`, {}, { skipErrorRedirect: true })
                    );
                    await Promise.all(promises);

                    // Update local state to reflect the change
                    const readItemIds = new Set(unreadItems.map(item => item._id));
                    setNotifications(prev =>
                        prev.map(n =>
                            readItemIds.has(n._id) ? { ...n, isRead: true } : n
                        )
                    );
                } catch (err) {
                    // Avoid logging if the error is 401, as it might be an expected race condition
                    if (err.response?.status !== 401) {
                        console.error("Error marking all as read:", err);
                    }
                }
            };

            // Mark as read after a short delay
            const timer = setTimeout(markAllAsRead, 2000);
            return () => clearTimeout(timer);
        }
    }, [notifications, user]);

    const markAsRead = async (id, itemType) => {
        try {
            if (itemType === 'message') {
                // For now, we just mark it as read in state or call the API
                await api.put(`/messages/${id}/read`, {}, { skipErrorRedirect: true });
                setNotifications(notifications.map(notif =>
                    notif._id === id ? { ...notif, isRead: true } : notif
                ));
            } else {
                await api.put(`/doctor-dashboard/notifications/${id}/read`, {}, { skipErrorRedirect: true });
                setNotifications(notifications.map(notif =>
                    notif._id === id ? { ...notif, isRead: true } : notif
                ));
            }
            toast.success('Marked as read.');
        } catch (err) {
            toast.error('Failed to mark as read.');
            console.error("Error marking as read:", err);
        }
    };

    const handleDelete = async (id, itemType) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                if (itemType === 'message') {
                    await api.delete(`/messages/${id}`, { skipErrorRedirect: true });
                    setNotifications(notifications.filter(notif => notif._id !== id));
                } else {
                    await api.delete(`/doctor-dashboard/notifications/${id}`, { skipErrorRedirect: true });
                    setNotifications(notifications.filter(notif => notif._id !== id));
                }
                toast.success('Deleted.');
            } catch (err) {
                toast.error('Failed to delete.');
                console.error("Error deleting:", err);
            }
        }
    };

    const handleDeleteAllChats = async () => {
        if (window.confirm('Are you sure you want to delete ALL messages and notifications? This action cannot be undone.')) {
            try {
                // Delete all notifications
                await api.delete('/doctor-dashboard/notifications', { skipErrorRedirect: true });

                // For messages, we might need a specific endpoint or loop through them if no bulk delete exists
                // Assuming /messages/all or similar might exist, if not we loop
                const messagesToDelete = notifications.filter(n => n.itemType === 'message');
                if (messagesToDelete.length > 0) {
                    await Promise.all(messagesToDelete.map(msg => api.delete(`/messages/${msg._id}`, { skipErrorRedirect: true })));
                }

                setNotifications([]);
                toast.success('All chats and notifications deleted successfully!');
            } catch (err) {
                toast.error('Failed to delete all chats.');
                console.error("Error deleting all chats:", err);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageContent.trim()) {
            toast.error('Please enter a message.');
            return;
        }
        if (!selectedPatient && !selectedAdmin) {
            toast.error('Please select at least one recipient (Patient or Admin).');
            return;
        }

        setSending(true);
        try {
            const sendPromises = [];
            if (selectedPatient) {
                sendPromises.push(api.post('/messages', { receiverId: selectedPatient, content: messageContent }, { skipErrorRedirect: true }));
            }
            if (selectedAdmin) {
                sendPromises.push(api.post('/messages', { receiverId: selectedAdmin, content: messageContent }, { skipErrorRedirect: true }));
            }

            const responses = await Promise.all(sendPromises);
            toast.success('Message sent successfully!');

            // Add all sent messages to notifications
            responses.forEach((response, index) => {
                const sentMessage = response.data;
                const targetId = index === 0 ? selectedPatient : selectedAdmin;
                const targetContact = availableContacts.patients.find(p => p._id === targetId) || 
                                     availableContacts.admins.find(a => a._id === targetId);
                
                const newMessageObject = {
                    _id: sentMessage._id || new Date().toISOString(),
                    itemType: 'message',
                    type: 'Doctor Message',
                    message: sentMessage.content,
                    sender: user._id,
                    receiver: sentMessage.receiver,
                    senderName: user.profileId?.name || user.email,
                    receiverName: targetContact?.profileId?.name || targetContact?.email || 'Unknown',
                    createdAt: sentMessage.createdAt || new Date().toISOString(),
                    isRead: true, // Sent messages are marked as read
                };

                setNotifications(prevNotifications =>
                    [...prevNotifications, newMessageObject].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                );
            });

            setMessageContent('');
            setSelectedPatient('');
            setSelectedAdmin('');
        } catch (err) {
            toast.error('Failed to send message.');
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="notifications-page">Loading notifications...</div>;
    }

    if (error) {
        return <div className="notifications-page error">{error}</div>;
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ marginBottom: 0 }}>Notifications & Messages</h1>
                {notifications.length > 0 && (
                    <button 
                        onClick={handleDeleteAllChats} 
                        className="delete-all-button"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Delete All Chat
                    </button>
                )}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">No new notifications or messages.</p>
                ) : (
                    notifications.map(notif => {
                        const isMessage = notif.itemType === 'message';
                        const isCurrentUserSender = isMessage && String(notif.sender) === String(user._id);
                        const itemClasses = `notification-item ${notif.isRead ? 'read' : 'unread'} ${isMessage ? (isCurrentUserSender ? 'message-sent' : 'message-received') : ''}`;

                        return (
                            <div key={notif._id} className={itemClasses}>
                                <div className="notification-content">
                                    {!isMessage ? (
                                        <>
                                            <span className={`notification-type ${notif.type.toLowerCase().replace(/\s/g, '-')}`}>
                                                {notif.type}
                                            </span>
                                            <p className="notification-message">{notif.message}</p>
                                        </>
                                    ) : (
                                        <>
                                            {isCurrentUserSender ? (
                                                <span className="sender-name sender-label">You</span>
                                            ) : (
                                                <span className="sender-name receiver-label">
                                                    {notif.senderName || 'Sender'}
                                                </span>
                                            )}
                                            <p className="notification-message">{notif.message}</p>
                                        </>
                                    )}
                                    <div className="notification-timestamp">
                                        <span title={new Date(notif.createdAt).toLocaleString()}>
                                            {moment(notif.createdAt).fromNow()}
                                        </span>
                                        {isCurrentUserSender ? (
                                            notif.isRead ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#34b7f1' }} title="Read">
                                                    <path d="M18 7l-9 9-4-4" />
                                                    <path d="M22 7l-9 9-4-4" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#9ca3af' }} title="Sent">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#9ca3af' }} title="Unread">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="notification-actions">
                                    {!isCurrentUserSender && !notif.isRead && (
                                        <button onClick={() => markAsRead(notif._id, notif.itemType)} className="action-button mark-read">Read</button>
                                    )}
                                    <button onClick={() => handleDelete(notif._id, notif.itemType)} className="action-button delete-notif">Del</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="message-section">
                <form onSubmit={handleSendMessage} className="message-form">
                    <div className="form-group" style={{ flexGrow: 0, minWidth: '150px' }}>
                        <select 
                            value={selectedPatient} 
                            onChange={(e) => setSelectedPatient(e.target.value)}
                        >
                            <option value="">Patient...</option>
                            {availableContacts.patients.map(patient => (
                                <option key={patient._id} value={patient._id}>
                                    {patient.profileId?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flexGrow: 0, minWidth: '150px' }}>
                        <select 
                            value={selectedAdmin} 
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                        >
                            <option value="">Admin...</option>
                            {availableContacts.admins.map(admin => (
                                <option key={admin._id} value={admin._id}>
                                    {admin.profileId?.name || admin.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="Type message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="send-button" disabled={sending}>
                        {sending ? '...' : ''}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorNotifications;
