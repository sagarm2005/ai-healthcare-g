import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/Auth/Login.jsx';
import RegisterPage from './pages/Auth/Register.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import PatientDashboard from './pages/Patient/PatientDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ROLES } from './utils/constants.js';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import AIChatbot from './components/AIChatbot.jsx';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard/Dashboard.jsx';
import DoctorManagement from './pages/Admin/DoctorManagement/DoctorManagement.jsx';

import AppointmentManagement from './pages/Admin/AppointmentManagement/AppointmentManagement.jsx';
import AdminProfile from './pages/Admin/Profile/AdminProfile.jsx';
import ViewAIReports from './pages/Admin/ViewAIReports.jsx';
import AdminNotifications from './pages/Admin/AdminNotifications.jsx';

// Doctor Pages
import MyPatients from './pages/Doctor/MyPatients.jsx';
import UpdateMedicalRecord from './pages/Doctor/UpdateMedicalRecord.jsx';
import CreatePrescription from './pages/Doctor/CreatePrescription.jsx';
import ViewAIPredictions from './pages/Doctor/ViewAIPredictions.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorNotifications from './pages/Doctor/DoctorNotifications.jsx';
import MedicalReportsDoctor from './pages/Doctor/MedicalReports.jsx';
import DoctorPrescriptions from './pages/Doctor/DoctorPrescriptions.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';

// Patient Pages
import BookAppointment from './pages/Patient/BookAppointment.jsx';
import ViewPrescriptions from './pages/Patient/ViewPrescriptions.jsx';
import UploadMedicalReport from './pages/Patient/UploadMedicalReport.jsx';
import EditPatientProfile from './pages/Patient/EditPatientProfile.jsx';
import NotificationsPage from './pages/Patient/NotificationsPage.jsx';
import DocumentsPage from './pages/Patient/DocumentsPage.jsx';
import PatientAppointments from './pages/Patient/PatientAppointments.jsx';
import MedicineSuggestion from './pages/Patient/MedicineSuggestion.jsx';

import PatientManagement from './pages/Admin/PatientManagement/PatientManagement.jsx';


function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/doctors" element={<DoctorManagement />} />
              <Route path="/admin/patients" element={<PatientManagement />} />
              <Route path="/admin/appointments" element={<AppointmentManagement />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/aireports" element={<ViewAIReports />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<MyPatients />} />
              <Route path="/doctor/patients/:id/updatemedicalrecord" element={<UpdateMedicalRecord />} />
              <Route path="/doctor/patients/:id/createprescription" element={<CreatePrescription />} />
              <Route path="/doctor/patients/:id/editprescription/:prescriptionId" element={<CreatePrescription />} />
              <Route path="/doctor/patients/:id/aipredictions" element={<ViewAIPredictions />} />
              <Route path="/doctor/medical-reports" element={<MedicalReportsDoctor />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/notifications" element={<DoctorNotifications />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
            </Route>

            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book-appointment" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/prescriptions" element={<ViewPrescriptions />} />
              <Route path="/patient/upload-medical-report" element={<UploadMedicalReport />} />
              <Route path="/patient/edit-profile" element={<EditPatientProfile />} />
              <Route path="/patient/notifications" element={<NotificationsPage />} />
              <Route path="/patient/documents" element={<DocumentsPage />} />
              <Route path="/patient/ai-medicine" element={<MedicineSuggestion />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <AIChatbot />
      <ToastContainer />
    </Router>
  );
}

export default App;
