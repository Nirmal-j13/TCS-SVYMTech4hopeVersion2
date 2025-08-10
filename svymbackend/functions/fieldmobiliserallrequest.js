const { db1 } = require('./utils/couchdb');
exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        // Fetch all student documents from the database
        const alldoc = await db1.allDocs({ include_docs: true });
        const all = alldoc.rows.map(row => row.doc);

        // You can keep the console.log for debugging, but it's not part of the response
        for(const fieldmobiliser of all) {
            console.log(`Field Mobiliser ID: ${fieldmobiliser._id}, Name: ${fieldmobiliser.FieldMobiliserName}, Email: ${fieldmobiliser.FieldMobiliserEmailID}, Region: ${fieldmobiliser.FieldMobiliserRegion}, Supported Project: ${fieldmobiliser.FieldMobiliserSupportedProject}, Status: ${fieldmobiliser.isAppRejPen}`);
        }
        
        // **THIS IS THE MISSING PIECE**
        // Return a successful response with the fetched data
        return {
            statusCode: 200,
            body: JSON.stringify({ fieldmobilisers: all }) // Wrap the array in a key for better practice
        };

    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }) // Include the error message for better debugging
        };
    }
};