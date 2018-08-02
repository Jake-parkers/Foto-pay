const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = require('express')();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('../config/winston');

const corsOptions = {
	origin: ['http://*'],
	methods: 'GET, PUT, POST',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}


app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,Accept');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //winston logging
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // return error response
  res.status(err.status || 500);
  res.json({success: false, status: "error", error: err});
});

const pay = require('./pay');

app.use(bodyParser.urlencoded({extended:false, limit: '10mb'}));
app.use(bodyParser.json());

app.use(morgan('combined', {stream: winston.stream}));


app.use('/pay', pay);

module.exports = app;

