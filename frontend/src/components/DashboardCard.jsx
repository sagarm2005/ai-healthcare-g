import React from 'react';
import './DashboardCard.css'; // Import the dashboard card styles

const DashboardCard = ({ title, value }) => {
    return (
        <div className="dashboard-card">
            <h3 className="dashboard-card-title">{title}</h3>
            <p className="dashboard-card-value">{value}</p>
        </div>
    );
};

export default DashboardCard;
