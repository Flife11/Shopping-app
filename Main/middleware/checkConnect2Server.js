const axios = require('axios');
const https = require('https');
let PaymentURL = process.env.PAYMENT_URL;

async function checkConnection() {
    const httpsAgent = new https.Agent({  
      rejectUnauthorized: false  // Note: This is insecure and should be used for testing purposes only.
    });
  
    try {
      const response = await axios.get(`${PaymentURL}/checkConnection`, { httpsAgent });
      console.log(`Connection from Server Main to Server Payment is successful. Status: ${response.status}`);
      return true;
    } catch (error) {
      console.error(`Error connecting from Server Main to Server Payment: ${error.message}`);
      return false;
    }
  }
module.exports = {
  checkConnection,
};