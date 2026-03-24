import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartComponent = ({ type, data, options }) => {
    if (type === 'bar') {
        return <Bar data={data} options={options} />;
    } else if (type === 'doughnut') {
        return <Doughnut data={data} options={options} />;
    }
    return <div>Unsupported Chart Type</div>;
};

export default ChartComponent;
