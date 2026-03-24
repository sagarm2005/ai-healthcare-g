import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { ROLES } from '../../utils/constants';
import '../style/Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [role, setRole] = useState(ROLES.Patient); // Default to Patient (using correct capitalization)
    
    // Patient fields
    const [dateOfBirth, setDateOfBirth] = useState(''); // For Patient
    const [gender, setGender] = useState(''); // For Patient
    const [age, setAge] = useState(''); // For Patient

    // Calculate age automatically when dateOfBirth changes
    useEffect(() => {
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge.toString());
        }
    }, [dateOfBirth]);
    const [bloodGroup, setBloodGroup] = useState(''); // For Patient
    const [address, setAddress] = useState(''); // For Patient

    // Doctor fields
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [qualification, setQualification] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');

    // Admin fields
    const [adminId, setAdminId] = useState('');



    // Common fields
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const [isRegistering, setIsRegistering] = useState(false);

    const { user, register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Redirect based on role after successful registration/login
            if (user.role === ROLES.Admin) {
                navigate('/admin/dashboard');
            } else if (user.role === ROLES.DOCTOR) {
                navigate('/doctor/dashboard');
            } else if (user.role === ROLES.PATIENT) {
                navigate('/patient/dashboard');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRegistering) return;

        setIsRegistering(true);
        try {
            if (!agreeToTerms) {
                toast.error('You must agree to the Terms & Conditions');
                setIsRegistering(false);
                return;
            }
            const sanitizedMobile = mobile.replace(/\D/g, '').slice(0, 10);
            if (sanitizedMobile && sanitizedMobile.length !== 10) {
                toast.error('Mobile number must be exactly 10 digits');
                setIsRegistering(false);
                return;
            }
            const userData = { email, password, name, role, mobileNumber: sanitizedMobile };
            if (role === ROLES.Patient) {
                userData.dateOfBirth = dateOfBirth;
                userData.gender = gender;
                userData.age = age;
                userData.bloodGroup = bloodGroup;
                userData.address = address;
            } else if (role === ROLES.Doctor) {
                userData.yearsOfExperience = yearsOfExperience;
                userData.qualification = qualification;
                userData.specialization = specialization;
                userData.hospitalName = hospitalName;
                userData.medicalRegistrationNumber = medicalRegistrationNumber;
            } else if (role === ROLES.Admin) {
                if (sanitizedMobile.length !== 10) {
                    toast.error('Admin mobile number must be exactly 10 digits');
                    setIsRegistering(false);
                    return;
                }
                userData.adminId = adminId;
            }
            await register(userData);
            toast.success('Registration successful!');
            // Redirection handled by useEffect
        } catch (error) {
            const responseData = error?.response?.data;
            const plainResponseMessage =
                typeof responseData === 'string' && !responseData.trim().startsWith('<')
                    ? responseData
                    : null;
            const message =
                responseData?.message ||
                plainResponseMessage ||
                error?.message ||
                'Registration failed';
            toast.error(message);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Register</h2>
                </div>
                <div className="register-body">
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                                disabled={isRegistering}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mobile">Mobile Number</label>
                            <input
                                type="tel"
                                id="mobile"
                                className="form-control"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                maxLength={10}
                                title="Enter exactly 10 digits"
                                autoComplete="tel"
                                disabled={isRegistering}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={isRegistering}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={isRegistering}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Register As:</label>
                            <select
                                id="role"
                                className="form-control"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={isRegistering}
                            >
                                <option value={ROLES.Patient}>Patient</option>
                                <option value={ROLES.Doctor}>Doctor</option>
                                <option value={ROLES.Admin}>Admin</option>
                            </select>
                        </div>

                        {role === ROLES.Patient && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        className="form-control"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        className="form-control"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="age">Age</label>
                                    <input
                                        type="number"
                                        id="age"
                                        className="form-control"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bloodGroup">Blood Group</label>
                                    <input
                                        type="text"
                                        id="bloodGroup"
                                        className="form-control"
                                        value={bloodGroup}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        className="form-control"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                            </>
                        )}

                        {role === ROLES.Doctor && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="yearsOfExperience">Years of Experience</label>
                                    <input
                                        type="number"
                                        id="yearsOfExperience"
                                        className="form-control"
                                        value={yearsOfExperience}
                                        onChange={(e) => setYearsOfExperience(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="qualification">Qualification (MBBS, MD, MS, etc.)</label>
                                    <input
                                        type="text"
                                        id="qualification"
                                        className="form-control"
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="specialization">Specialization (Cardiology, Orthopedics, etc.)</label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        className="form-control"
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="hospitalName">Hospital Name</label>
                                    <input
                                        type="text"
                                        id="hospitalName"
                                        className="form-control"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="medicalRegistrationNumber">Medical Registration Number</label>
                                    <input
                                        type="text"
                                        id="medicalRegistrationNumber"
                                        className="form-control"
                                        value={medicalRegistrationNumber}
                                        onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                            </>
                        )}



                        {role === ROLES.Admin && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="adminId">Admin ID</label>
                                    <input
                                        type="text"
                                        id="adminId"
                                        className="form-control"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        required
                                        disabled={isRegistering}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                required
                                disabled={isRegistering}
                            />
                            <label htmlFor="agreeToTerms">
                                I agree to the <Link to="/terms">Terms & Conditions</Link>
                            </label>
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn-register"
                                style={{background: '#6c757d'}}
                                disabled={isRegistering}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn-register"
                                disabled={isRegistering}
                            >
                                {isRegistering ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                    <div className="register-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
