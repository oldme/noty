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
var clients		  = require('./clientList.js').getClientList();

cache = require('./GlobalCache.js').getGlobalCache(clients.validClient); 


//> NotyTcpServer createTCPServer(int)
exports.createTCPServer = createTCPServer;



//> void NotyTcpServer(int)
function NotyTcpServer(port)
{
	var net   	= require('net');
	var carrier = require('carrier'); //<carrier

	var notyServer = this;
	var server = net.createServer(
		function (socket) 
			{		
				carrier.carry(socket, function(line) 
					 {
						 notyServer.dispatchCommand(line,socket);
					 }
				);
				 /*
				socket.write('Echo server\r\n');
				socket.pipe(socket);
				*/
			}
		);
	server.listen(port);
};

NotyTcpServer.prototype.notifyUpdate = function (app,table,id,session)
{
	var sock = clients[session]; //<socket
	
}

NotyTcpServer.prototype.notifyDelete = function (app,table,id,session)
{
	
}

NotyTcpServer.prototype.notifyNew = function (app,table,id,session)
{
	
}

NotyTcpServer.prototype.dispatcher=
{
	"persistence"	: function (cmd)
		{
			// appKey  sessionId
			
		},
	"update"		: function (cmd)
		{
			// appKey sessionId table id	
			//function (appNameKey, tableName, id, updaterSessionId, notifyFunction)
			cache.onUpdate(cmd.appKey,cmd.table,cmd.id,cmd.sessionId,this.notifyUpdate);
		},		
	"delete"		: function (cmd)
		{
			cache.onDelete(cmd.appKey,cmd.table,cmd.id,cmd.sessionId,this.notifyDelete);
			// appKey sessionId table id
		},
	"new"			: function (cmd)
		{
			// appKey sessionId table id
			//function (appNameKey, tableName, id, creatorSessionId, notifyFunction) 
			cache.onNew(cmd.appKey, cmd.table, cmd.id, cmd.sessionId, this.notifyNew);
		},		
	"subscribe"		: function (cmd)
		{
			// appKey sessionId table id1-id2,id3-id4,id5
			//function (appNameKey, tableName, ranges, sessionId)
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
        console.log(cmd);
    }
    else
    {
    	if(cmd.cmd == "registerClient")
    	{
    		clients.addClient(cmd.sessionId,socket);
    		return ;
    	}
    	else if(cmd.secret != "secret")
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