const { db } = require('./utils/couchdb');

exports.handler = async (event, context) => {
    try {
        // Change to GET method for fetching a single document by ID
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }

        // Get the student ID from the URL query parameters
        const studentId = event.queryStringParameters.id;

        // Check if the student ID is provided
        if (!studentId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Student ID is required.' })
            };
        }

        // Fetch the single document from CouchDB
        const onedoc = await db.get(studentId);

        // Return a successful response with the fetched data
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(onedoc)
        };

    } catch (error) {
        console.error('Error in handler:', error);
        
        // Handle a "not found" error specifically
        if (error.statusCode === 404) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Student not found.', error: error.message })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};