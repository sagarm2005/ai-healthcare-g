import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from "@google/generative-ai";
import AIReport from '../models/AIReport.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Medicine from '../models/Medicine.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// @desc    Chat with AI for symptom analysis and medicine suggestion
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    try {
        const userInput = message.toLowerCase();
        
        // 1. Check if database is empty and log it
        const medCount = await Medicine.countDocuments();
        console.log(`Searching in ${medCount} medicines for: "${userInput}"`);

        if (medCount === 0) {
            return res.json({ reply: "The medicine database is currently empty. Please run 'npm run data:import' in the backend folder to load your MID.xlsx data." });
        }

        // 2. Search using MongoDB Regex for better performance and reliability
        // This looks for any word in the user's message that exists in 'uses' or 'name'
        const keywords = userInput.split(/\s+/).filter(word => word.length > 2);
        
        let bestMatch = await Medicine.findOne({
            $or: [
                { name: { $regex: userInput, $options: 'i' } },
                { uses: { $regex: userInput, $options: 'i' } },
                ...keywords.map(kw => ({ uses: { $regex: kw, $options: 'i' } })),
                ...keywords.map(kw => ({ name: { $regex: kw, $options: 'i' } }))
            ]
        });

        // Fetch all relevant medicines for context (up to 10 for prompt efficiency)
        const relevantMedicines = await Medicine.find({
            $or: [
                { uses: { $regex: userInput, $options: 'i' } },
                ...keywords.map(kw => ({ uses: { $regex: kw, $options: 'i' } }))
            ]
        }).limit(10);

        // 3. FALLBACK: If API Key is missing
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE' || process.env.GEMINI_API_KEY === "") {
            if (bestMatch) {
                return res.json({ 
                    reply: `Based on your symptoms, here is a suggested medicine from our database:
                    
Medicine: ${bestMatch.name}
Usage: ${bestMatch.uses}
Advice: ${bestMatch.how_to_use}

DISCLAIMER: This is an automated suggestion. Please consult a professional doctor before taking any medication.` 
                });
            } else {
                return res.json({ reply: "I couldn't find a direct match in our database for those symptoms. Please consult a doctor for a proper diagnosis." });
            }
        }

        let medicineContext = "";
        if (relevantMedicines.length > 0) {
            medicineContext = "\nHere are some relevant medicines from our database:\n" + 
                relevantMedicines.map(m => `- ${m.name}: ${m.uses}. Side effects: ${m.side_effects}. How to use: ${m.how_to_use}. Safety: ${m.safety_advice}`).join('\n');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `You are a Smart Doctor Assistant. Analyze patient symptoms and provide a response strictly in the following format:

Possible Condition: [Condition Name]

Suggested Medicine:
- [Medicine 1]
- [Medicine 2]

Basic Precautions:
- [Precaution 1]
- [Precaution 2]

Doctor Consultation Advice:
[Advice on when or why to see a doctor]

Use the following context from our medicine database to provide accurate suggestions if applicable:
${medicineContext}

IMPORTANT: Always include this exact medical disclaimer at the very bottom: "DISCLAIMER: This is an AI-generated suggestion. Please consult a professional doctor before taking any medication."`
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500);
        throw new Error('Failed to communicate with AI service');
    }
});

// Sample AI prediction logic (replace with actual AI model integration)
const simulateAIPrediction = async (patientData, predictionType) => {
    // In a real application, this would call an external AI service
    // or run an ML model. For now, it's a simulation.
    let result = {};
    if (predictionType === 'DiseasePrediction') {
        const diseases = ['Flu', 'Common Cold', 'Hypertension', 'Diabetes', 'Asthma'];
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
        const confidence = (Math.random() * 0.4 + 0.6).toFixed(2); // 60-100%
        result = {
            predictedDisease: randomDisease,
            confidence: parseFloat(confidence),
            recommendations: `Consult a specialist for ${randomDisease}.`,
        };
    } else if (predictionType === 'HealthAssessment') {
        const healthStatus = ['Good', 'Fair', 'Poor'];
        const randomStatus = healthStatus[Math.floor(Math.random() * healthStatus.length)];
        result = {
            overallStatus: randomStatus,
            bmi: (Math.random() * 10 + 20).toFixed(1), // 20-30
            bloodPressure: `${Math.floor(Math.random() * 40 + 90)}/${Math.floor(Math.random() * 20 + 60)}`,
            suggestions: 'Maintain a healthy diet and exercise.',
        };
    }
    return result;
};


// @desc    Generate AI prediction for a patient
// @route   POST /api/ai/predict/:patientId
// @access  Private/Doctor
const generateAIPrediction = asyncHandler(async (req, res) => {
    const { predictionType } = req.body; // e.g., 'DiseasePrediction', 'HealthAssessment'
    const patientId = req.params.patientId;

    if (!predictionType) {
        res.status(400);
        throw new Error('Prediction type is required');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Simulate getting patient data for AI model
    const patientDataForAI = {
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        // In a real app, you'd fetch more detailed medical history, symptoms, etc.
    };

    const aiResult = await simulateAIPrediction(patientDataForAI, predictionType);

    const aiReport = await AIReport.create({
        patient: patientId,
        doctor: req.user.profileId, // Doctor who initiated the prediction
        reportType: predictionType,
        reportData: aiResult,
    });

    if (aiReport) {
        res.status(201).json(aiReport);
    } else {
        res.status(400);
        throw new Error('Could not generate AI report');
    }
});

// @desc    Get AI reports for a specific patient (can be accessed by patient or doctor)
// @route   GET /api/ai/reports/:patientId
// @access  Private/Doctor or Private/Patient
const getPatientAIReports = asyncHandler(async (req, res) => {
    const patientId = req.params.patientId;
    const aiReports = await AIReport.find({ patient: patientId })
        .populate('doctor', 'name specialization')
        .populate('patient', 'name');

    // Basic authorization: Patient can see their own, Doctor can see for their assigned patients
    // Admin can see all, handled in admin routes
    if (req.user.role === 'Patient' && req.user.profileId.toString() !== patientId) {
        res.status(403);
        throw new Error('Not authorized to view these reports');
    }
    // For Doctor, further check if patient is assigned to them (not implemented here for brevity)

    res.json(aiReports);
});


export { generateAIPrediction, getPatientAIReports, chatWithAI };
