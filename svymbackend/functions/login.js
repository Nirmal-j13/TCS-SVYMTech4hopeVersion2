// netlify/functions/login.js
const { db } = require('./utils/couchdb'); // Only need db instance here
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { userId, password } = JSON.parse(event.body); // 'password' here can be initial PIN or actual password

        if (!userId || !password) {
            return { statusCode: 400, body: JSON.stringify({ message: 'User ID and password/PIN are required.' }) };
        }
        
        let userDoc;
        try {
            userDoc = await db.get(userId);
        } catch (error) {
            if (error.status === 404) {
                return { statusCode: 401, body: JSON.stringify({ message: 'Invalid User ID or Password/PIN.' }) };
            }
            throw error; // Re-throw other database errors
        }

        // Case 1: First Login (using initial 4-digit PIN)
        if (userDoc.isFirstLogin) {
            // Compare the provided password (which is the initial PIN) directly with the stored hashed PIN
            const isMatch = await bcrypt.compare(password, userDoc.password); // Compare plain PIN with hashed PIN

            if (isMatch) {
                // Correct initial PIN, prompt for new password
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'This is your first login. Please set a new 4-digit PIN.',
                        isFirstLoginPrompt: true // Signal frontend to show PIN change fields
                    })
                };
            } else {
                return { statusCode: 401, body: JSON.stringify({ message: 'Invalid User ID or First-time PIN.' }) };
            }
        }
        // Case 2: Subsequent Login (using actual password)
        else {
            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, userDoc.password);

            if (isMatch) {
                // Update login count (optional, but good for analytics)
                userDoc.loginCount = (userDoc.loginCount || 0) + 1;
                userDoc.lastLoginAt = new Date().toISOString();
                await db.put(userDoc); // Save updated doc

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Login successful!',
                        user: { userId: userDoc._id, email: userDoc.email } // Return minimal user data
                    })
                };
            } else {
                return { statusCode: 401, body: JSON.stringify({ message: 'Invalid User ID or Password/PIN.' }) };
            }
        }

    } catch (error) {
        console.error('Netlify Function login error:', error);
        if (error.message.includes('authorization') || error.message.includes('authentication')) {
             return { statusCode: 401, body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to CouchDB. Check COUCHDB_PROD_URL.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${error.message}` }) };
    }
};