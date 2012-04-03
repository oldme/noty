/*
 * 
 * (c) Axiologic SaaS SRL
*/

process.on('uncaughtException', function(err) {
  console.log(err);
});

require('./tcpServer.js').createTCPServer(3000);
console.info("Ready...");

