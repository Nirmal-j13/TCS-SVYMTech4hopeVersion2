const { db1, fieldmobiliserensureDesignDoc, generateUniqueFiveDigitSuffixdb1 } = require('./utils/couchdb');

fieldmobiliserensureDesignDoc(); // Ensure design doc exists
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        // Parse the JSON body from the request
        const data = JSON.parse(event.body);
        
        // Define a list of required fields for validation
        const requiredFields = [
            'FieldMobiliserName',
            'FieldMobiliserEmailID',
            'FieldMobiliserMobileNo',
            'FieldMobiliserRegion',
            'FieldMobiliserSupportedProject'
        ];

        // Perform basic validation to ensure all required fields are present
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: `Missing required field: ${field}` }),
                };
            }
        }
        const uniqueSuffix = await generateUniqueFiveDigitSuffixdb1();
        const userId = `SVYMFM${uniqueSuffix}`;
        
        const newuser={
            _id: userId,
            FieldMobiliserName: data.FieldMobiliserName,
            FieldMobiliserEmailID: data.FieldMobiliserEmailID,
            FieldMobiliserMobileNo: data.FieldMobiliserMobileNo,
            FieldMobiliserRegion: data.FieldMobiliserRegion,
            FieldMobiliserSupportedProject: data.FieldMobiliserSupportedProject,
            isAppRejPen: 0, // Default status for new mobilisers
            createdAt: new Date().toISOString() // Store the creation date
        }
         const response = await db1.put(newuser);
         if(response.ok) {
            // Log the successful signup (for debugging purposes)
            console.log(`New mobiliser signed up: ${data.FieldmobiliserName} with User ID: ${userId}`);
             return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Sign up successful! Your User ID and First-time PIN are generated.',
                    userId: userId,
                    // Send back the plain PIN for first-time display
                })
            };
         }
         else {
            return { statusCode: 500, body: JSON.stringify({ message: `Sign up failed: ${response.reason || 'Unknown database error'}` }) };
        }

    } catch (error) {
        // Log the error for backend debugging
        console.error('Error processing signup request:', error);
        
        // Return a generic error response for the client
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An unexpected error occurred. Please try again later.' }),
        };
    }
};
