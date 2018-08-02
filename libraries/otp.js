const otp = require('otp.js');
const HOTP = otp.hotp;

const uuidv4 = require('uuid/v4');

class OTP {
    constructor(){
    }

    generateOTP() {
        const secret = uuidv4();
        try {
            // generate otp for key '12345678901234567890' in string format 
            let token = HOTP.gen({string:secret});
            return {token:token,secret: secret};
        }catch(ex) {
            console.log(ex);
        }
    }

    verifyOTP(token, secret) {
        try {
            const result = HOTP.verify(token, {string:secret});
            if(result !=  null) {
                return result
            }else return null
        }catch(ex) {
            console.log(ex);
        }
    }

}
module.exports = OTP;

// // new OTP().generateOTP();
// new OTP().verifyOTP('427175','11df0e1f-5ebb-4fa-bdb3-e453ca455195');