const Redis = require('ioredis');
Redis.Promise.onPossiblyUnhandledRejection(function (error) {
    if(error.command && error.command.name && error.command.args){
        console.log("Redis error: "+error.command.name + ":" + error.command.args);
        // logger.error(new Error(error));
    }
});

let redis;

function connect() {
  const client = new Redis({
    port: 10510,          // Redis port
    host:"redis-10510.c8.us-east-1-4.ec2.cloud.redislabs.com",
    password: process.env.REDIS_PASSWORD,
  });
  // console.log(client)
  return client;
} 


module.exports = connect;
