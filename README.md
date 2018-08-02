# Foto-pay
A simple api integrating Flutterwave's Rave api(written in nodejs)

GETTING STARTED

A simple library to interact directly with Rave api was created and is contained in libraries/ravepay.js

TESTING

All tests are contained in the test/ folder. 

The third test has been commented out and should be run only after the first two tests have been run

To run tests, do:

npm test

once this test is passed, comment out the first two tests and uncomment the last test and follow the instructions in the comment then run:

‘npm test’ again

DEMO

A simple demo is can be tested at https://foto-pay.herokuapp.com/

NOTE: I'm sending the OTP by mail instead of to user phone number because of sms charges

The demo uses this api to interact with rave for card payments
