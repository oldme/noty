/*
 * 
 * (c) Axiologic SaaS SRL
*/


/*
 * //commands get read in this format:  cmd=persistence&appKey=value&sessionId=value&...
 * persistence -> noty
 persistence 	appKey sessionId 
 update 		appKey sessionId table id
 delete 		appKey sessionId table id
 new 			appKey sessionId table id
 follows 		appKey sessionId table id1-id2,id3-id4,id5
 notifyNew 		appKey sessionId table all
 logout 		appKey sessionId 

 * noty -> client
 change 		table  id 		 new|update|delete

 * client -> noty
  client 		appKey sessionId userName 
  clientLogout  socket
 */

var cache; //<GlobalCache		  
var clients		  = require('./clientList.js').getClientList(); //<ClientList
cache = require('./GlobalCache.js').getGlobalCache(clients.validClient); //<GlobalCache


//> NotyTcpServer createTCPServer(int)
exports.createTCPServer = createTCPServer;



//> void NotyTcpServer(int)
function NotyTcpServer(port)
{
	var net   	= require('net');
	var carrier = require('carrier'); //<carrier

	var notyServer = this;	
	notyServer.name="tcpserver";
	var server = net.createServer(
		function (socket) 
			{	
				carrier.carry(socket, function(line) 
					 {												
						//console.log(line);
						notyServer.dispatchCommand(line,socket);
					 }
				);				 
			}
		);
	server.listen(port);
};

function createChangeText(table,id,user,type)
{
	var cmd 		= new Object();
	cmd.cmd 		= "client";
	cmd.table 		= table;
	cmd.id 			= id;
	cmd.user 		= user;
	cmd.type 		= type;  
	return require('querystring').stringify(cmd)+"\n";
};

function notifyUpdate(app,table,id,session)
{
//	console.log("Notifing in "+session);
//	console.log(clients[session]);	
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"update"));
}

function notifyDelete(app,table,id,session)
{
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"delete"));
}

function notifyNew(app,table,id,session)
{
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"new"));
}

NotyTcpServer.prototype.dispatcher=
{
	"persistence"	: function (cmd)
		{
			// appKey  sessionId
			
		},
	"update"		: function (cmd)
		{

			cache.onUpdate(cmd.appKey,cmd.table,cmd.id,cmd.sessionId,notifyUpdate);
		},		
	"delete"		: function (cmd)
		{
			cache.onDelete(cmd.appKey,cmd.table,cmd.id,cmd.sessionId,notifyDelete);
		},
	"new"			: function (cmd)
		{
			cache.onNew(cmd.appKey, cmd.table, cmd.id, cmd.sessionId,notifyNew);
		},		
	"subscribe"		: function (cmd)
		{
			cache.subscribe(cmd.appKey,cmd.table,cmd.ranges,cmd.sessionId);
		},
	"subscribeNew"		: function (cmd)
		{
			// appKey sessionId table
			cache.subscribeNew(cmd.appKey,cmd.table,cmd.sessionId);
		},		
	"logout"		: function (cmd)
		{
			// appKey sessionId 
			clients.deleteClient(cmd.sessionId)
		}

};

NotyTcpServer.prototype.dispatchCommand = function(line,socket)
{
	var querystring   	= require('querystring');   
    var cmd = querystring.parse(line);
   
    if(cmd.cmd ==null)
    {
    	console.log('Got one wrong line: ' + line + ' parsed as ');
        
    }
    else
    {
    	if(cmd.cmd == "client")
    	{
    		console.info("New client "+cmd.sessionId+"/"+cmd.user);
    		clients.addClient(cmd.sessionId,socket,cmd.user);
    		return ;
    	}
    	else if(cmd.secret != "secret") //TODO: get this secret from a configuration file
    	{
    		console.log("Wrong secret! Ignoring\n");
    		return ;
    	}

    	var f = this.dispatcher[cmd.cmd]; 
        if(f != null)
    	{
    		f(cmd,socket);
    	}
    	else
    	{
    		console.log('Got one wrong line: ' + line + ' parsed as ');
            console.log(cmd);
    	}
    }
}


//> NotyTcpServer createTCPServer(int)
function createTCPServer(port) 
{
	return new NotyTcpServer(port);
}; 