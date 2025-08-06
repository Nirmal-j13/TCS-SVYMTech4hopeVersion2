const { db } = require('./utils/couchdb');

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'PUT') {
            return {
                statusCode: 405,
                headers: { 'Allow': 'PUT' },
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body is required.' })
            };
        }

        // Parse the updated student data from the request body
        const updatedStudent = JSON.parse(event.body);

        // Required fields for CouchDB update: _id and _rev
        if (!updatedStudent._id || !updatedStudent._rev) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Student ID and revision number are required for update.' })
            };
        }

        // Insert the updated document. Nano will use the _id and _rev
        // to handle the update correctly.
        
        const response = await db.put(updatedStudent);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Student data updated successfully', ...response })
        };

    } catch (error) {
        console.error('Error in studentupdate:', error);

        if (error.statusCode === 409) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'Conflict: The document has been updated by another process. Please try again.', error: error.message })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};