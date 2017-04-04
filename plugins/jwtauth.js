'use strict';

const hapiAuthJWT = require('hapi-auth-jwt2');
const JWT         = require('jsonwebtoken');

exports.register = function(server, options, next) {

  var secret = 'NeverShareYourSecret'; // Never Share This! even in private GitHub repos!

  var people = {
    1: {
      id: 1,
      name: 'Anthony Valid User'
    },
    2: {
      id: 2,
      name: 'Another User'
    }
  }

  // use the token as the 'authorization' header in requests
  var token = JWT.sign(people[2], secret); // synchronous
  console.log(token);
  // bring your own validation function
  var validate = function (decoded, request, callback) {
    
    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return callback(null, false);
    }
    else {
      return callback(null, true);
    }
  };

  server.register(hapiAuthJWT, function (err) {
    if(err){
      console.log(err);
    }
    // see: http://hapijs.com/api#serverauthschemename-scheme
    server.auth.strategy('jwt', 'jwt',
    { key: secret, validateFunc: validate,
      verifyOptions: { ignoreExpiration: true }
    });

    server.auth.default('jwt');

  });



  return next();
};

exports.register.attributes = {  
  name: 'jwt-auth'
}