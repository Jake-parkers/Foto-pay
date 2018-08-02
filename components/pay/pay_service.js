let RaveCard = require('../../libraries/ravepay');
let card = new RaveCard();
const OTP = require('../../libraries/otp');
const otp = new OTP();
const redis_client = require('../../libraries/redis-connection.js')();
// browser-sync start --server --files index.css scripts/*.js index.html

class PayService{
	constructor(){}
	
	charge(card_details){
		return new Promise((resolve, reject) => {
			card.initiatePayment(card_details)	
				.then(response => {
					console.log(card_details);
					var message = response['data']['chargeResponseMessage'];
					if(response['status'] == 'success' && response['message'] == 'AUTH_SUGGESTION') {
						// collect pin from user
						resolve("Card Valid, Request PIN from user")
					}else if(response['status'] == 'success' && response['data']['chargeResponseCode'] == '02') {
						//next stop validate payment by sending otp
						let otp = this.OTP;
						console.log("GOT HERE");
						Promise.all([
							this.saveOTP(otp,response['data']['customer']['email']),
							card.sendOTP(response['data']['customer']['email'], otp.token),
							this.saveTransactionDetails(response['data']['flwRef'], response['data']['customer']['email'])
						]).then(response => {
								resolve(message);
							}).catch(error => reject(error));
					}else {
						console.log("res: ", response);
					}
			}).catch(error => {
				console.log("error: ", error);
				reject(error);
			})
		});
	}

	saveTransactionDetails(transaction_reference, email) {
		return new Promise((resolve, reject) => {
			redis_client.hmset(email+"-trans_ref", {
				transaction_reference
			}).then(response => {
				resolve(response);
			}).catch(error => reject(error))
		});
	}

	get OTP() {
		return otp.generateOTP();
	}

	saveOTP(otp, email) {
		redis_client.hmset(email,{
			token: otp.token,
			secret: otp.secret,
			exp: Math.floor(Date.now()) + (300000)
		}).then(response => {
			console.log(response);
		}).catch(error => {
			console.log(error);
		})
	}

	verifyOtp(user_data) {
		console.log(user_data);
		return new Promise((resolve, reject) => {
			redis_client.hgetall(user_data['email'])
			.then(response => {	
				const token = response['token'],
						secret = response['secret'];
				// if the token supplied by the user is not the same as that stored in redis reject the request
				if(user_data.otp != token) {
					reject("Invalid Token Supplied");
				}
				let tokenIsValid = otp.verifyOTP(token, secret);
				if(tokenIsValid) {
						let today = new Date();
						let otp_time = response['exp'];
						if(otp_time > today) {
							// otp is valid. Proceed to validate Payment
							this.validatePayment(user_data.otp, user_data.email)
								.then(response => {
									resolve(response);
								}).catch(error => {
									reject(error);
								})
						}else reject("OTP expired");	
				}
				else reject("OTP not valid");
			}).catch(error => {	
				reject(error);
			})
		})
	}

	validatePayment(otp, email) {
		return new Promise((resolve, reject) => {
			redis_client.hgetall(email+'-trans_ref')
			.then(response => {
				if(response && response['transaction_reference']) {
					card.validatePayment({otp, transaction_reference: response['transaction_reference']})
						.then(trans_result => {
							/**
							 * Verify Payment
							 */
							if(trans_result['status'] != "success") reject({success:false, error: "An error occurred while processing payment", user_email: email, amount:trans_result['data']['tx']['charged_amount']})
							if(response['transaction_reference'] != trans_result['data']['tx']['flwRef']) reject({success:false, error: "An error occurred while processing payment", user_email: email, amount:trans_result['data']['tx']['charged_amount']});
							if(trans_result['data']['tx']['chargeResponseCode'] != '00') reject({success:false, error: "An error occurred while processing payment", user_email: email, amount:trans_result['data']['tx']['charged_amount']});
							if(trans_result['data']['tx']['currency'] != 'NGN') reject({success:false, error: "An error occurred while processing payment", user_email: email, amount:trans_result['data']['tx']['charged_amount']});
							if(trans_result['data']['tx']['charged_amount'] < trans_result['data']['tx']['amount']) reject({success:false, error: "An error occurred while processing payment", user_email: email, amount:trans_result['data']['tx']['charged_amount']});
							resolve({user_email: email, amount:trans_result['data']['tx']['charged_amount'], success:true, message: "Payment successful"});

						}).catch(error => console.log(error));
				}
			})
		})
	}
}

module.exports = PayService;