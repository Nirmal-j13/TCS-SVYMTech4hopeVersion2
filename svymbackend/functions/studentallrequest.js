const { db } = require('./utils/couchdb');
exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        // Fetch all student documents from the database
        const alldoc = await db.allDocs({ include_docs: true });
        const all = alldoc.rows.map(row => row.doc);

        // You can keep the console.log for debugging, but it's not part of the response
        for (const student of all) {
            console.log(`Student ID: ${student._id}, Name: ${student.candidateName}, Email: ${student.email}, Course: ${student.supportedProject}, Status: ${student.isAppRejPen}`);
        }
        
        // **THIS IS THE MISSING PIECE**
        // Return a successful response with the fetched data
        return {
            statusCode: 200,
            body: JSON.stringify({ students: all }) // Wrap the array in a key for better practice
        };

    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }) // Include the error message for better debugging
        };
    }
};