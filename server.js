'use strict';

const Hapi = require('hapi');  
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();  
server.connection({  
  port: 3000
});

//Connect to db
server.app.db = mongojs('192.168.56.102/hapi-rest-mongo', ['books']);

server.register([  
  require('./plugins/jwtauth'),
  require('./routes/lists')
], (err) => {

  if (err) {
    throw err;
  }

});


server.start(function () {
  console.log('Server running at:', server.info.uri);
});