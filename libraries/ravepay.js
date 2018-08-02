// my personal rave library to handle just card payments built using the original flutterwave rave documentation
const CryptoJS = require('crypto-js');
const forge    = require('node-forge');
const utf8     = require('utf8');
const request = require('request-promise-native');
const md5 = require('md5');

// const Nexmo = require('nexmo');
// const nexmo = new Nexmo({
//   apiKey: process.env.NEXMO_API_KEY,
//   apiSecret: process.env.NEXMO_API_SECRET
// });

var twilio = require('twilio');
var client = new twilio(process.env.accountSid, process.env.authToken);

var sendOptions = {
	from: process.env.twilioNumber,
	to: '',
	text: ''
}

var options = {
	url: "",
	method: "",
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	},
	body: {
		"PBFPubKey": process.env.RAVE_PUBLIC_KEY,
		"alg": "3DES-24",
		client: "",
	},
	json: true
}

class Rave {
	/**
	 * Rave object constructor
	 * @param {*} public_key This is a string that can be found in merchant rave dashboard
	 * @param {*} secret_key This is a string that can be found in merchant rave dashboard
	 */
	constructor(){}

	static encryptCardDetails(card_details) {
		let cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(Rave.getKey()));
    cipher.start({iv:''});
    cipher.update(forge.util.createBuffer(card_details, 'utf-8'));
    cipher.finish();
    let encrypted = cipher.output;
    return ( forge.util.encode64(encrypted.getBytes()) );
	}

	static getKey() {
	let sec_key = process.env.RAVE_SECRET_KEY;
    let keymd5 = md5(sec_key);
    let keymd5last12 = keymd5.substr(-12);

    let seckeyadjusted = sec_key.replace('FLWSECK-', '');
    let seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

    return seckeyadjustedfirst12 + keymd5last12;
	}

	initiatePayment(card_details) {
		return new Promise((resolve, reject) => {
			let encrypted_card_details = Rave.encryptCardDetails(card_details);
			let payment_options = Object.assign({}, options);
			payment_options.url = 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/charge';
			payment_options.body.client = encrypted_card_details;
			payment_options.method = 'POST';
			request(payment_options)
				.then((result) => {
					resolve(result);
				}).catch((err) => {
					if(err['error'] && err['error']['data'])
						reject(err['error']['data']);
					else if(err['error'] && err['error']['message'])
						reject(err['error']['message'])
					else reject(err);
				});
			})
	}

	validatePayment(transaction_object) {
		let validate_options = Object.assign({}, options);
		delete validate_options.body.alg;
		delete validate_options.body.client;
		validate_options.url = 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/validatecharge';
		validate_options.method = 'POST';
		validate_options.body.otp = transaction_object['otp'];
		validate_options.body.transaction_reference = transaction_object['transaction_reference'];

		return new Promise((resolve, reject) => {
			request(validate_options)
			.then(response => {
				resolve(response);
			}).catch(err => {
				if(err['error'] && err['error']['data'])
					reject(err['error']['data']);
				else reject(err);
			})
		});
	}

	handleTimeOut() {

	}

	initiateWebHook(){

	}

	sendOTP(phonenumber, otp) {
		sendOptions.to = "+234"+phonenumber.replace(phonenumber[0],"");
		sendOptions.text = otp;
		return new Promise((resolve, reject) => {
			client.messages.create({
					body: sendOptions.text,
					to: sendOptions.to,  // Text this number
					from: sendOptions.from // From a valid Twilio number
			})
			.then((message) => {
				resolve(`OTP sent to ${phonenumber}`)
			})
			.catch(error => {
				reject(error);
			})
		});
	}
	
}

module.exports = Rave;