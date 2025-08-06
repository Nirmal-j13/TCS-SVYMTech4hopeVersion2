const { all } = require('axios');
const { db } = require('./utils/couchdb');

exports.handler = async (event, context) => {
    // We already know this check is working, so let's keep it here.
    console.log("hello")

    totalrequests = 0;
    totalapproved = 0;
    totalrejected = 0;
    totalpending = 0;
    try {
        console.log(event.httpMethod)
      if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ message: 'Method Not Allowed' }) 
        };
    }
        const { studentId, isAppRejPen } = JSON.parse(event.body);

        // Fetch the document to get the latest _rev
        const userDoc = await db.get(studentId);
        
        // Update the single field. No need to re-assign _rev.
        // PouchDB/CouchDB automatically handles the _rev for you.
        userDoc.isAppRejPen = isAppRejPen;

        // Put the updated document back into the database
        await db.put(userDoc);

        // Fetch all documents to log the updated student document
      
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Student status for ${studentId} updated successfully.`})
        };
        
    } catch (error) {
        // Log the full error for debugging purposes
        console.error('Netlify Function error:', error);

        // Handle specific CouchDB/PouchDB errors with clear messages
        if (error.status === 404) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Student ID not found.' })
            };
        }

        if (error.status === 409) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'Conflict: The document has been updated by another user. Please try again.' })
            };
        }

        // Handle general server errors
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Internal server error: ${error.message}` })
        };
    }
};