import api from './api';

const API_URL = '/admin';

export const getDashboardStats = async () => {
    const response = await api.get(`${API_URL}/stats`);
    return response.data;
};

export const getAllDoctors = async () => {
    const response = await api.get(`${API_URL}/doctors`);
    return response.data;
};

export const createDoctor = async (doctorData) => {
    const response = await api.post(`${API_URL}/doctors`, doctorData);
    return response.data;
};

export const updateDoctor = async (id, doctorData) => {
    const response = await api.put(`${API_URL}/doctors/${id}`, doctorData);
    return response.data;
};

export const deleteDoctor = async (id) => {
    const response = await api.delete(`${API_URL}/doctors/${id}`);
    return response.data;
};

export const approveDoctor = async (id, isApproved) => {
    const response = await api.put(`${API_URL}/doctors/${id}/approve`, { isApproved });
    return response.data;
};

export const getAllPatients = async () => {
    const response = await api.get(`${API_URL}/patients`);
    return response.data;
};

export const updatePatient = async (id, patientData) => {
    const response = await api.put(`${API_URL}/patients/${id}`, patientData);
    return response.data;
};

export const deletePatient = async (id) => {
    const response = await api.delete(`${API_URL}/patients/${id}`);
    return response.data;
};

export const getAllAppointments = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${API_URL}/appointments?${params}`);
    return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
    const response = await api.put(`${API_URL}/appointments/${id}/status`, { status });
    return response.data;
};

export const getAdminProfile = async () => {
    const response = await api.get(`${API_URL}/profile`);
    return response.data;
};

export const updateAdminProfile = async (profileData) => {
    const response = await api.put(`${API_URL}/profile`, profileData);
    return response.data;
};

export const rescheduleAppointment = async (id, newDate, newTime) => {
    const response = await api.put(`${API_URL}/appointments/${id}/reschedule`, { date: newDate, time: newTime });
    return response.data;
};
