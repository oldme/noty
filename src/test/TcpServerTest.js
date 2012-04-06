var clients		  = require('../clientList.js').getClientList(); //<ClientList
var cache		  = require('../GlobalCache.js').getGlobalCache(clients.validClient);

require('../tcpServer.js').createTCPServer(3000);

var net = require('net');

var persistence= net.createConnection(3000);

var client1 = net.createConnection(3000);
var client2 = net.createConnection(3000);
var client3 = net.createConnection(3000);

var callCounter = new Object();

function mkCall(table,id,user)
{
	return table+'/'+id+'/'+user;
}

function registerExpectedCall(table,id,user)
{
	var call = mkCall(table,id,user);
	if(!Object.prototype.hasOwnProperty.call(callCounter, call))
	{
		callCounter[call] = 0;
	}
	callCounter[call]++;
}

function doCall(table,id,user)
{
	var call = mkCall(table,id,user);
	if(!Object.prototype.hasOwnProperty.call(callCounter, call))
	{
		callCounter[call] = 0;
	}
	
	if(callCounter[call] <=0)
	{
		console.log("Unexpected call " + call);
	}
	callCounter[call]--;
}


function registerClient(clientSocket,sessionId,user)
{
	  //client 		appKey sessionId userName 
	  //clientLogout  socket
	clientSocket.write("cmd=client"+"&sessionId="+sessionId+"user="+user);
	var carrier = require('carrier'); //<carrier

	carrier.carry(clientSocket, function(line) {
		var querystring   	= require('querystring');   
	    var cmd = querystring.parse(line);
	    doCall(cmd.table,cmd.id,cmd.user);
	 	});
}


registerClient(client1,"session1","user1");
registerClient(client2,"session2","user2");
registerClient(client3,"session3","user3");



function sendCmd(forSession,cmd){	
	var querystring   	= require('querystring');   
    var cmd 			= querystring.stringify(cmd);
    
	persistence.write(querystring+"\n");
}

//(cmd.appKey,cmd.table,cmd.ranges,cmd.sessionId)

sendCmd({
			appKey:"app",
			cmd:"subscribe",
			table:"table1",
			sessionId:"session1",
			ranges:"1-10,500,1000-2000",
			secret:"secret"
		});


sendCmd({
			appKey:"app",
			cmd:"subscribe",
			table:"table1",
			sessionId:"session2",
			ranges:"1-10,500,1000-1500",
			secret:"secret"
		});

sendCmd({
			appKey:"app",
			cmd:"subscribe",
			table:"table1",
			sessionId:"session3",
			ranges:"1-10,1000",
			secret:"secret"	
		});

registerExpectedCall("table1",500,"user1");		
sendCmd({
			appKey:"app",
			cmd:"update",
			table:"table1",
			sessionId:"session2",
			id:"500",
			secret:"secret"
		});

		
registerExpectedCall("table1",10,"user1");
registerExpectedCall("table1",10,"user2");
sendCmd({
	appKey:"app",
	cmd:"update",
	table:"table1",
	sessionId:"session3",
	id:"10"	,
	secret:"secret"
});


setTimeout(function(){	
	console.log("No other messages,all tests passing!\n");
	//check that there are no expected but duplicated and therefore invalid calls 
	for(var callName in callCounter){	
		if(callCounter[callName] >0){
			console.log("Missing calls for " + callName +" (" + callCounter[callName]+ ')');
		}
		
		if(callCounter[callName] <0){
			console.log("Unexpected calls for " + callName +" ( " + callCounter[callName] + ')');
		}
	}


	persistence.end();
	client1.end();
	client2.end();
	client3.end();
	process.exit();
	},1000);

