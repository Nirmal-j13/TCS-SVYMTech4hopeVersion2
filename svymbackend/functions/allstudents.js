const { db } = require('./utils/couchdb');

exports.handler = async (event, context) => {
    try {
        // Use allDocs with a key range to efficiently filter documents
        // This is a much better approach than retrieving all documents and filtering them in memory
        if(event.httpMethod !== 'GET') {
            return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
        }
        const response = await db.allDocs({
            include_docs: true,
            startkey: 'SVYM',
            endkey: 'SVYM\ufff0' // This is a special character to create an inclusive range
        });
        
        // Extract the full document objects from the response
        const students = response.rows.map(row => row.doc);
        console.log(students)
        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({ students })
        };
    } catch (error) {
        console.error('Netlify Function error:', error);

        // More granular error handling for CouchDB/PouchDB errors
        if (error.message.includes('authorization') || error.message.includes('authentication')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to CouchDB. Check environment variables.' })
            };
        }
        
        // For any other unexpected errors
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Internal server error: ${error.message}` })
        };
    }
}