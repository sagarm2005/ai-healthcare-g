import React from 'react';
import moment from 'moment';

const MessageBubble = ({ message, isCurrentUserSender }) => {
    return (
        <div className={`message-bubble ${isCurrentUserSender ? 'sent' : 'received'}`}>
            {!isCurrentUserSender && <div className="message-sender">{message.senderName}</div>}
            <div className="message-content">{message.message}</div>
            <div className="message-meta">
                <span>{moment(message.createdAt).format('h:mm A')}</span>
                {isCurrentUserSender && (
                    message.isRead ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#34b7f1' }} title="Read">
                            <path d="M18 7l-9 9-4-4" />
                            <path d="M22 7l-9 9-4-4" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', color: '#9ca3af' }} title="Unread">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    )
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
