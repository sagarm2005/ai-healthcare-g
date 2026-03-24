// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../../../components/DashboardCard';
import { getDashboardStats } from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner';
// import './Dashboard.css';
// import '../Dashboard/Dashboard.css';
import './Dashboard.css';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="admin-dashboard-container">
            <h1>Admin Dashboard</h1>
            
            {/* Latest Registered Users Section */}
            <div className="latest-registered-section">
                <h2>Latest Registered</h2>
                <div className="latest-cards-grid">
                    <div className="latest-card patient">
                        <h3>Latest Patient</h3>
                        {stats?.latestPatient ? (
                            <>
                                <p><strong>Name:</strong> {stats.latestPatient.name}</p>
                                <p><strong>Email:</strong> {stats.latestPatient.email}</p>
                                <p><strong>Date:</strong> {new Date(stats.latestPatient.createdAt).toLocaleDateString()}</p>
                            </>
                        ) : <p>No patients registered yet.</p>}
                    </div>
                    <div className="latest-card doctor">
                        <h3>Latest Doctor</h3>
                        {stats?.latestDoctor ? (
                            <>
                                <p><strong>Name:</strong> {stats.latestDoctor.name}</p>
                                <p><strong>Email:</strong> {stats.latestDoctor.email}</p>
                                <p><strong>Date:</strong> {new Date(stats.latestDoctor.createdAt).toLocaleDateString()}</p>
                            </>
                        ) : <p>No doctors registered yet.</p>}
                    </div>
                    <div className="latest-card admin">
                        <h3>Latest Admin</h3>
                        {stats?.latestAdmin ? (
                            <>
                                <p><strong>Name:</strong> {stats.latestAdmin.name}</p>
                                <p><strong>Email:</strong> {stats.latestAdmin.email}</p>
                                <p><strong>Date:</strong> {new Date(stats.latestAdmin.createdAt).toLocaleDateString()}</p>
                            </>
                        ) : <p>No admins registered yet.</p>}
                    </div>
                </div>
            </div>

            <div className="action-buttons" style={{ marginBottom: '1rem' }}>
                <Link to="/admin/profile?edit=true" className="btn btn-indigo">Edit</Link>
                <button type="button" className="btn btn-blue" onClick={() => navigate(-1)}>Back</button>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-cards-grid">
                <DashboardCard title="Total Doctors" value={stats?.totalDoctors ?? 0} />
                <DashboardCard title="Total Patients" value={stats?.totalPatients ?? 0} />
                <DashboardCard title="Total Appointments" value={stats?.totalAppointments ?? 0} />
            </div>

            {/* Management Sections */}
            <div className="management-sections">

                {/* Doctor Management */}
                <section className="dashboard-section">
                    <h2>Doctor Management</h2>
                    <div className="action-buttons">
                        <Link to="/admin/doctors" className="btn btn-blue">View All Doctors</Link>
                        <Link to="/admin/doctors/add" className="btn btn-green">Add New Doctor</Link>
                    </div>
                </section>

                {/* Patient Management */}
                <section className="dashboard-section">
                    <h2>Patient Management</h2>
                    <div className="action-buttons">
                        <Link to="/admin/patients" className="btn btn-blue">View All Patients</Link>
                        <Link to="/admin/patients/add" className="btn btn-green">Add Patient</Link>
                    </div>
                </section>

                {/* Appointment Management */}
                <section className="dashboard-section">
                    <h2>Appointment Management</h2>
                    <div className="action-buttons">
                        <Link to="/admin/appointments" className="btn btn-blue">View All Appointments</Link>
                    </div>
                    <p className="filter-note">
                        Filter by: Date, Doctor, Status (Pending / Approved / Completed / Cancelled)
                    </p>
                </section>

                {/* Admin Profile */}
                <section className="dashboard-section">
                    <h2>Admin Profile</h2>
                    <div className="action-buttons">
                        <Link to="/admin/profile?edit=true" className="btn btn-indigo">Edit Profile Details</Link>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AdminDashboard;
