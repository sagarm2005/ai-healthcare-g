export const ROLES = {
    ADMIN: 'Admin',
    DOCTOR: 'Doctor',
    PATIENT: 'Patient',
    Admin: 'Admin',
    Doctor: 'Doctor',
    Patient: 'Patient',
};

export const API_BASE_URL = 'http://localhost:5000';

export const getUploadUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
};

export const REPORT_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Discharge Summary', 'Checkup', 'Emergency', 'Follow-up', 'Lab Test', 'Surgery'];
