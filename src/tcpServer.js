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


var clients		  = require('./clientList.js').clientsModule.getClientList();
var cache		  = require('./GlobalCache.js').getGlobalCache(clients.validClient);

//> NotyTcpServer createTCPServer(int)
exports.createTCPServer = createTCPServer;



//> void NotyTcpServer(int)
function NotyTcpServer(port)
{
	var net   	= require('net');
	var carrier = require('carrier'); 

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


NotyTcpServer.prototype.dispatcher=
{
	"persistence"	: function (cmd)
		{
			// appKey  sessionId
			
		},
	"update"		: function (cmd)
		{
			// appKey sessionId table id	
			cache.onUpdate(cmd.appKey,cmd.appKey,cmd.table,cmd.id,cmd.sessionId,this.notify);
		},		
	"delete"		: function (cmd)
		{
			cache.onDelete(cmd.appKey,cmd.appKey,cmd.table,cmd.id,cmd.sessionId,this.notify);
			// appKey sessionId table id
		},
	"new"			: function (cmd)
		{
			// appKey sessionId table id
			cache.onNew(cmd.appKey, cmd.table, cmd.id, cmd.sessionId, this.notify);
		},		
	"subscribe"		: function (cmd)
		{
			// appKey sessionId table id1-id2,id3-id4,id5
		},
	"subscribeNew"		: function (cmd)
		{
			// appKey sessionId table
		},		
	"logout"		: function (cmd)
		{
			// appKey sessionId 

		},
	"client"		: function (cmd,socket)
		{
			// appKey, sessionId, userName 
			clients.addClient(cmd.sessionId,socket)
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