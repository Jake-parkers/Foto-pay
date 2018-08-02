const router = require('express').Router();

const PayController = require('./pay_controller');
const pay = new PayController();

const request = require('request-promise-native');
var options = {
	url: "http://localhost:7000/pay/webhook/sendemail",
	method: "POST",
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	},
	body: {
		email: "",
		subject: "",
		message: ""
	},
	json: true
}

router.get('/', (req, res) => {
  res.status(200).send({message: "Here's the pay route"})
});

router.post('/charge', (req, res) => {
	let card_details = req.body;
	card_details['PBFPubKey'] = process.env.RAVE_PUBLIC_KEY;
	pay.chargeCard(card_details)
		.then(result => {
			res.status(200).json({status:"success", message: result});
		}).catch(error => {
			res.status(400).json({status: "error", error: error});
		})
})

router.post('/verifyotp', (req, res) => {
	let { otp, email } = req.body;
	pay.verifyOtp({otp, email})
		.then(result => {
			res.status(200).json({status:"success", message: result});
			process.exit();
		})
		.catch(error => {
			res.status(400).json({status: "error", error: error});
		})
});

module.exports = router;