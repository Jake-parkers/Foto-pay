var express = require('express'); // (npm install --save express)
var request = require('supertest');
var expect = require('chai').expect;
var server = require('../index');

describe('Card Payment', function() {

	// Test initial intiation of Payment (without pin)	
	it('should send back a JSON object with status set to success and message set to Card Valid, Request PIN from user', function(done) {
    request(server)
			.post('/pay/charge')
			.set('Content-Type', 'application/json')
			.send({
				"PBFPubKey": "FLWPUBK-ba0a57153f497c03bf34a9e296aa9439-X",
				"cardno": "5399838383838381",
				"cvv": "470",
				"expirymonth": "10",
				"expiryyear": "22",
				"currency": "NGN",
				"country": "NG",
				"amount": "10",
				"email": "test@gmail.com",
				"phonenumber": "08075376980",
				"firstname": "Joshua",
				"lastname": "Boateng",
				"IP": "355426087298442",
				"txRef": "MC-1533022374376",
			})
			.expect('Content-Type', /json/)
			.expect(200, function(err, res) {
				if(err) return done(err);
				status = res.body.status;
				expect(status).to.equal('success');
				message = res.body.message;
				expect(message).to.equal('Card Valid, Request PIN from user');
				done();
			});
	});

	// Test initial intiation of Payment (with pin and suggested_auth)	
	it('should send back a JSON object with status set to succes and a message indicating otp was sent to user', function(done) {
    request(server)
			.post('/pay/charge')
			.set('Content-Type', 'application/json')
			.send({
				"cardno": "5399838383838381",
				"cvv": "470",
				"expirymonth": "10",
				"expiryyear": "22",
				"currency": "NGN",
				"country": "NG",
				"amount": "10",
				"email": "test@gmail.com",
				"phonenumber": "08075376980",
				"firstname": "Joshua",
				"lastname": "Boateng",
				"IP": "355426087298442",
				"txRef": "MC-1533022374376",
				"suggested_auth": "PIN",
				"pin": "3310"
			})
			.expect('Content-Type', /json/)
			.expect(200, function(err, res) {
				if(err) return done(err);
				status = res.body.status;
				expect(status).to.equal('success');
				done();
			});
	});


	/**
	 * Ensure the otp value here is set to the latest one (i.e the otp value the above test creates)
	 * This test should run alone 
	 * Comment out the first two tests before running this test
	 */
	// it('should return a JSON object with status set to success and a message showing payment is successful', function (done) { 
	// 	request(server)
	// 		.post('/pay/verifyotp')
	// 		.set('Content-Type', 'application/json')
	// 		.send({
	// 			"otp": "106586", // should be changed based on otp sent to user
	// 			"email": "test@gmail.com"
	// 		})
	// 		.expect('Content-Type', /json/)
	// 		.expect(200, function(err, res) {
	// 			if(err) return done(err);
	// 			status = res.body.status;
	// 			expect(status).to.equal('success');
	// 			done();
	// 		})
	// 		.end(function (err, res) { 
	// 			console.log(err);
	// 		 })
	// })
})

// https://docs.google.com/document/d/1EBERkd9mQEeUWnmGQGPmXl3E_ziQzleZrP95ypsaC0Q/edit?usp=sharing