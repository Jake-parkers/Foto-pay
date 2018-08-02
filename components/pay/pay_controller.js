const PayService = require('./pay_service');
const pay = new PayService();

class PayController {
	constructor(){}

	checkCardDetails(card_details) {
		let {PBFPubKey,cardno,cvv,expirymonth,expiryyear,currency,country,amount,email,phonenumber,firstname,lastname,IP,txRef} = card_details;

		if(!PBFPubKey || !cardno || !cvv || !expirymonth || !expiryyear || !currency || !country || !amount || !email || !phonenumber || !firstname || !lastname || !IP || !txRef) {
			return false;
		}else return true;
	}
	
	chargeCard(card_details){
		return new Promise((resolve, reject) => {
			pay.charge(JSON.stringify(card_details))
				.then(response => resolve(response))
				.catch(error => reject(error))
		});
	}

	verifyOtp(user_data) {
		return new Promise((resolve, reject) => {
			pay.verifyOtp(user_data)
				.then(response => resolve(response))
				.catch(error => reject(error));
		})
	}

	sendMail(mail_data) {
		return new Promise((resolve, reject) => {
			pay.sendEmail(mail_data)
				.then(response => {
					console.log(response);
				}).catch(error => {
					console.log(error);
				})
		})
	}
}

module.exports = PayController;