// netlify/functions/signup.js
const { db, ensureDesignDoc, generateUniqueFiveDigitSuffix } = require('./utils/couchdb');
const bcrypt = require('bcrypt'); // Import bcrypt for secure hashing

// Ensure design doc exists when the function is invoked
// In a production setup, you might run this once on deploy or use a separate script.
// For Netlify Functions, running it on each invocation is generally fine for idempotent operations.
ensureDesignDoc();
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const data = JSON.parse(event.body);

        // --- Server-Side Validation ---
        const requiredFields = [
            'candidateName', 'email', 'dob', 'age', 'familyMembers', 'qualification',
            'caste', 'gender', 'tribal', 'pwd', 'aadharNumber',
            'candidatePhone', 'parentPhone', 'mobiliserName', 'supportedProject' // Added supportedProject
        ];
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                return { statusCode: 400, body: JSON.stringify({ message: `Missing required field: ${field}` }) };
            }
        }

        // Specific format validations
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid email address.' }) };
        }
        if (!/^\d{12}$/.test(data.aadharNumber)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Aadhar Number must be 12 digits.' }) };
        }
        if (!/^\d{10}$/.test(data.candidatePhone) || !/^\d{10}$/.test(data.parentPhone)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Phone numbers must be 10 digits.' }) };
        }
        if (isNaN(parseInt(data.age, 10)) || data.age < 0) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Age must be a valid non-negative number.' }) };
        }
        if (isNaN(parseInt(data.familyMembers, 10)) || data.familyMembers < 1) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Number of family members must be at least 1.' }) };
        }
        // --- End Validation ---

        // Check if user already exists by email
        const emailCheckResult = await db.query('users/by_email', {
            key: data.email,
            include_docs: false
        });

        if (emailCheckResult.rows.length > 0) {
            return { statusCode: 409, body: JSON.stringify({ message: 'A user with this email ID already exists. Please use a different email.' }) };
        }

        // Generate Unique User ID (SVYMXXXXX) and First Login PIN
        const uniqueSuffix = await generateUniqueFiveDigitSuffix();
        const userId = `SVYM${uniqueSuffix}`;
        const firstLoginPin = uniqueSuffix; // First-time PIN is the 5-digit suffix

        // Hash the initial PIN using bcrypt for secure storage
        // bcrypt.hash takes the plain string and a salt round (higher = slower, more secure)
        const hashedPassword = await bcrypt.hash(firstLoginPin, 10); // 10 salt rounds recommended

        const newUser = {
            _id: userId, // CouchDB document ID is the generated User ID
            candidateName: data.candidateName,
            fatherHusbandName: data.fatherHusbandName,
            villageName: data.villageName,
            talukName: data.talukName,
            districtName: data.districtName,
            dob: data.dob,
            age: data.age,
            familyMembers: data.familyMembers,
            qualification: data.qualification,
            caste: data.caste,
            gender: data.gender,
            tribal: data.tribal,
            pwd: data.pwd,
            aadharNumber: data.aadharNumber,
            candidatePhone: data.candidatePhone,
            parentPhone: data.parentPhone,
            mobiliserName: data.mobiliserName,
            supportedProject: data.supportedProject,
            email: data.email,
            password: hashedPassword, // Store the hashed PIN
            isFirstLogin: true, // Flag to indicate first-time login
            loginCount: 0,
            isAppRejPen: 0,
            createdAt: new Date().toISOString()
        };

        const response = await db.put(newUser);
        

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Sign up successful! Your User ID and First-time PIN are generated.',
                    userId: userId,
                    firstLoginPin: firstLoginPin // Send back the plain PIN for first-time display
                })
            };

        } else {
            return { statusCode: 500, body: JSON.stringify({ message: `Sign up failed: ${response.reason || 'Unknown database error'}` }) };
        }

    } catch (error) {
        console.error('Netlify Function signup error:', error);
        // More granular error handling for CouchDB/PouchDB errors
        if (error.status === 409) {
            return { statusCode: 409, body: JSON.stringify({ message: 'Conflict: User ID or Email may already exist. Please try again or use a different email.' }) };
        } else if (error.message.includes('authorization') || error.message.includes('authentication')) {
             return { statusCode: 401, body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to CouchDB. Check COUCHDB_PROD_URL.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${error.message}` }) };
    }
};