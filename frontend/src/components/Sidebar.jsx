import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

import ChatDropdown from './ChatDropdown';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const isLandingPage = location.pathname === '/' || location.pathname === '/home';
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (!user || isLandingPage || isAuthPage) {
        return null; // Don't show sidebar if not logged in or on landing/auth pages
    }

    const toggleSidebar = () => setIsOpen(!isOpen);

    const getNavLinkClass = (path) => {
        return `flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white ${
            location.pathname === path ? 'bg-indigo-700 text-white' : 'text-indigo-200'
        } ${!isOpen ? 'justify-center' : ''}`;
    };

    const icons = {
        dashboard: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
        users: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
        appointment: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
        reports: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 2v-6m-8-12h8a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"></path></svg>,
        profile: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
        record: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        prescription: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
        notification: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
        document: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
        chat: <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>,
    };

    return (
        <div className={`${isOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white min-h-screen p-4 shadow-lg transition-all duration-300 ease-in-out`}>
            <div className="flex items-center justify-between mb-6">
                {isOpen && <h2 className="text-2xl font-bold text-indigo-100 truncate">Dashboard</h2>}
                <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-indigo-700 focus:outline-none ml-auto">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
            <nav>
                <ul className="space-y-2">
                    {user.role?.toLowerCase() === ROLES.Admin.toLowerCase() && (
                        <>
                            <li>
                                <Link to="/admin/dashboard" className={getNavLinkClass("/admin/dashboard")}>
                                    {icons.dashboard}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Admin Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/doctors" className={getNavLinkClass("/admin/doctors")}>
                                    {icons.users}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Manage Doctors</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/patients" className={getNavLinkClass("/admin/patients")}>
                                    {icons.users}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Manage Patients</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/appointments" className={getNavLinkClass("/admin/appointments")}>
                                    {icons.appointment}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Manage Appointments</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/aireports" className={getNavLinkClass("/admin/aireports")}>
                                    {icons.reports}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Patient Medical Reports</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/profile" className={getNavLinkClass("/admin/profile")}>
                                    {icons.profile}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Admin Profile</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/notifications" className={getNavLinkClass("/admin/notifications")}>
                                    {icons.notification}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Chat / Message</span>}
                                </Link>
                            </li>
                        </>
                    )}
                    {user.role?.toLowerCase() === ROLES.Doctor.toLowerCase() && (
                        <>
                            <li>
                                <Link to="/doctor/dashboard" className={getNavLinkClass("/doctor/dashboard")}>
                                    {icons.dashboard}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Doctor Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/patients" className={getNavLinkClass("/doctor/patients")}>
                                    {icons.users}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">My Patients</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/appointments" className={getNavLinkClass("/doctor/appointments")}>
                                    {icons.appointment}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">My Appointments</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/prescriptions" className={getNavLinkClass("/doctor/prescriptions")}>
                                    {icons.prescription}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">My Patient Prescriptions</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/medical-reports" className={getNavLinkClass("/doctor/medical-reports")}>
                                    {icons.reports}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Patient Medical Reports</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/notifications" className={getNavLinkClass("/doctor/notifications")}>
                                    {icons.notification}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Chat / Message</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/doctor/profile" className={getNavLinkClass("/doctor/profile")}>
                                    {icons.profile}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Doctor Profile</span>}
                                </Link>
                            </li>
                        </>
                    )}
                    {user.role?.toLowerCase() === ROLES.Patient.toLowerCase() && (
                        <>
                            <li>
                                <Link to="/patient/dashboard" className={getNavLinkClass("/patient/dashboard")}>
                                    {icons.dashboard}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Patient Dashboard</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/book-appointment" className={getNavLinkClass("/patient/book-appointment")}>
                                    {icons.appointment}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Book Appointment</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/appointments" className={getNavLinkClass("/patient/appointments")}>
                                    {icons.appointment}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Upcoming Appointments</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/prescriptions" className={getNavLinkClass("/patient/prescriptions")}>
                                    {icons.prescription}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">View Prescriptions</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/upload-medical-report" className={getNavLinkClass("/patient/upload-medical-report")}>
                                    {icons.reports}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Upload Medical Report</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/edit-profile" className={getNavLinkClass("/patient/edit-profile")}>
                                    {icons.profile}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Profile</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/notifications" className={getNavLinkClass("/patient/notifications")}>
                                    {icons.notification}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Chat / Message</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/ai-medicine" className={getNavLinkClass("/patient/ai-medicine")}>
                                    {icons.chat}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">AI Medicine Suggestion</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/patient/documents" className={getNavLinkClass("/patient/documents")}>
                                    {icons.document}
                                    {isOpen && <span className="ml-3 whitespace-nowrap">Patient Medical Reports</span>}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
