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
		})
		.catch(error => {
			res.status(400).json({status: "error", error: error});
		})
})

router.post('/webhook/sendemail', (req, res) => {
	/* It is a good idea to log all events received. Add code *
 * here to log the signature and body to db or file       */
  
  // retrieve the signature from the header
  var hash = req.headers["verif-hash"];
  
  if(!hash) {
	  // discard the request,only a post with rave signature header gets our attention 
	  res.status(400)
	  res.json({status:"error", error:"Invalid hook"});
  }
  
  // Get signature stored as env variable on your server
  const secret_hash = process.env.RAVE_SECRET_KEY;
  
  // check if signatures match
  if(hash !== secret_hash) {
   // silently exit, or check that you are passing the write hash on your server.
   res.status(400)
res.json({status:"error", error:"Invalid key"});
  }
  
  // Retrieve the request's body
  var request_json = JSON.parse(request.body);

  // Give value to your customer but don't give any output
// Remember that this is a call from rave's servers and 
// Your customer is not seeing the response here at all
  response.send(200);
	// send email to user whether transaction failed or not

	// pay.sendMail(req.body)
	// 	.then(result => {
	// 		console.log(result);
	// 	}).catch(error => console.log(error));
})

module.exports = router;