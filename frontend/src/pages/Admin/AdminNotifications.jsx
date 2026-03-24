import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment';
import '../style/NotificationsPage.css';

const AdminNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [availableContacts, setAvailableContacts] = useState({ doctors: [], patients: [] });
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/notifications', { skipErrorRedirect: true });
            setNotifications(response.data);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch notifications.';
            setError(message);
            toast.error(message);
            console.error("Error fetching admin notifications:", err);
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

    useEffect(() => {
        fetchNotifications();
        fetchContacts();
    }, []);

    // Automatically mark all unread notifications as read
    useEffect(() => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        if (unreadNotifications.length > 0) {
            const markAllAsRead = async () => {
                try {
                    const promises = unreadNotifications.map(notif =>
                        notif.itemType === 'message'
                            ? api.put(`/messages/${notif._id}/read`, {}, { skipErrorRedirect: true })
                            : api.put(`/admin/notifications/${notif._id}/read`, {}, { skipErrorRedirect: true })
                    );
                    await Promise.all(promises);
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                } catch (err) {
                    console.error("Error marking all as read:", err);
                }
            };
            const timer = setTimeout(markAllAsRead, 2000);
            return () => clearTimeout(timer);
        }
    }, [notifications.length]);

    const markAsRead = async (id, itemType) => {
        try {
            if (itemType === 'message') {
                await api.put(`/messages/${id}/read`, {}, { skipErrorRedirect: true });
            } else {
                await api.put(`/admin/notifications/${id}/read`, {}, { skipErrorRedirect: true });
            }
            setNotifications(notifications.map(notif =>
                notif._id === id ? { ...notif, isRead: true } : notif
            ));
            toast.success('Marked as read.');
        } catch (err) {
            toast.error('Failed to mark as read.');
            console.error("Error marking as read:", err);
        }
    };

    const handleDeleteNotification = async (id, itemType) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                if (itemType === 'message') {
                    await api.delete(`/messages/${id}`, { skipErrorRedirect: true });
                } else {
                    await api.delete(`/admin/notifications/${id}`, { skipErrorRedirect: true });
                }
                setNotifications(notifications.filter(notif => notif._id !== id));
                toast.success('Deleted.');
            } catch (err) {
                toast.error('Failed to delete.');
                console.error("Error deleting:", err);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageContent.trim()) {
            toast.error('Please enter a message.');
            return;
        }
        if (!selectedDoctor && !selectedPatient) {
            toast.error('Please select at least one recipient (Doctor or Patient).');
            return;
        }

        setSending(true);
        try {
            const sendPromises = [];
            if (selectedDoctor) {
                sendPromises.push(api.post('/messages', { receiverId: selectedDoctor, content: messageContent }));
            }
            if (selectedPatient) {
                sendPromises.push(api.post('/messages', { receiverId: selectedPatient, content: messageContent }));
            }

            const responses = await Promise.all(sendPromises);
            toast.success('Message sent successfully!');

            if (responses.length > 0 && responses[0].data) {
                const sentMessage = responses[0].data;
                const newMessageObject = {
                    _id: sentMessage._id || new Date().toISOString(),
                    itemType: 'message',
                    type: 'Admin Message',
                    message: sentMessage.content,
                    sender: user._id,
                    receiver: sentMessage.receiver,
                    senderName: user.profileId?.name || user.email,
                    createdAt: new Date(),
                    isRead: false,
                };

                setNotifications(prevNotifications => 
                    [newMessageObject, ...prevNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );
            }

            setMessageContent('');
            setSelectedDoctor('');
            setSelectedPatient('');
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
            <h1>Admin Notifications</h1>

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
                                        {notif.isRead ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#34b7f1' }} title="Read">
                                                <path d="M18 7l-9 9-4-4" />
                                                <path d="M22 7l-9 9-4-4" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#9ca3af' }} title="Unread">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="notification-actions">
                                    {!notif.isRead && (
                                        <button onClick={() => markAsRead(notif._id, notif.itemType)} className="action-button mark-read">Read</button>
                                    )}
                                    <button onClick={() => handleDeleteNotification(notif._id, notif.itemType)} className="action-button delete-notif">Del</button>
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
                            value={selectedDoctor} 
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                            <option value="">Doctor...</option>
                            {availableContacts.doctors.map(doctor => (
                                <option key={doctor._id} value={doctor._id}>
                                    {doctor.profileId?.name}
                                </option>
                            ))}
                        </select>
                    </div>
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

export default AdminNotifications;
