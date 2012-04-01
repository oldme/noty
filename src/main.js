/*
 * 
 * (c) Axiologic SaaS SRL
*/

process.on('uncaughtException', function(err) {
  console.log(err);
});

var tcpServerModule   = require('./tcpServer.js');

tcpServerModule.createTCPServer(3000);
console.info("Ready...");