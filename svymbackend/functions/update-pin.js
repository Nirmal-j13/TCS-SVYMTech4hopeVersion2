// netlify/functions/update-pin.js
const { db } = require('./utils/couchdb'); // Only need db instance
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { userId, oldPin, newPin } = JSON.parse(event.body);

        if (!userId || !oldPin || !newPin) {
            return { statusCode: 400, body: JSON.stringify({ message: 'All fields (User ID, old PIN, new PIN) are required.' }) };
        }

        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'New PIN must be a 4-digit number.' }) };
        }

        let userDoc;
        try {
            userDoc = await db.get(userId);
        } catch (error) {
            if (error.status === 404) {
                return { statusCode: 404, body: JSON.stringify({ message: 'User not found.' }) };
            }
            throw error;
        }

        // Validate old PIN against stored hashed PIN
        // This is crucial to ensure the user is authorized to change their PIN.
        const isOldPinMatch = await bcrypt.compare(oldPin, userDoc.password);
        if (!isOldPinMatch) {
            return { statusCode: 401, body: JSON.stringify({ message: 'Invalid old PIN provided.' }) };
        }

        // Hash the new PIN
        const hashedNewPin = await bcrypt.hash(newPin, 10); // 10 salt rounds

        // Update user document
        userDoc.password = hashedNewPin;
        userDoc.isFirstLogin = false; // Mark as no longer first login
        // It's good practice to clear the 'firstLoginPin' field if it existed directly
        // on the doc to prevent accidental exposure or misuse, although it's already hashed.
        if (userDoc.firstLoginPin) {
            delete userDoc.firstLoginPin;
        }

        const response = await db.put(userDoc);

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'PIN updated successfully!' })
            };
        } else {
            return { statusCode: 500, body: JSON.stringify({ message: `Failed to update PIN: ${response.reason || 'Unknown database error'}` }) };
        }

    } catch (error) {
        console.error('Netlify Function update-pin error:', error);
        if (error.message.includes('authorization') || error.message.includes('authentication')) {
             return { statusCode: 401, body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to CouchDB. Check COUCHDB_PROD_URL.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${error.message}` }) };
    }
};