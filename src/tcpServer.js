/*
 * 
 * (c) Axiologic SaaS SRL
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

function notifyUpdate(tenant,table,id,session)
{
//	console.log("Notifing in "+session);
//	console.log(clients[session]);	
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"update"));
}

function notifyDelete(tenant,table,id,session)
{
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"delete"));
}

function notifyNew(tenant,table,id,session)
{
	var socket = clients.clients[session].socket; //<Socket
	socket.write(createChangeText(table,id,clients.clients[session].user,"new"));
}

NotyTcpServer.prototype.dispatcher=
{
	"persistence"	: function (cmd)
		{
			// tenantKey  sessionId
			
		},
	"update"		: function (cmd)
		{

			cache.onUpdate(cmd.tenantKey,cmd.table,cmd.id,cmd.sessionId,notifyUpdate);
		},		
	"delete"		: function (cmd)
		{
			cache.onDelete(cmd.tenantKey,cmd.table,cmd.id,cmd.sessionId,notifyDelete);
		},
	"new"			: function (cmd)
		{
			cache.onNew(cmd.tenantKey, cmd.table, cmd.id, cmd.sessionId,notifyNew);
		},		
	"subscribe"		: function (cmd)
		{
			cache.subscribe(cmd.tenantKey,cmd.table,cmd.ranges,cmd.sessionId);
		},/*
    "subscribeAll"		: function (cmd)
        {
    cache.subscribeAll(cmd.tenantKey,cmd.table,cmd.ranges,cmd.sessionId);
        },*/
	"subscribeNew"		: function (cmd)
		{
			// tenantKey sessionId table
			cache.subscribeNew(cmd.tenantKey,cmd.table,cmd.sessionId);
		},		
	"logout"		: function (cmd)
		{
			// tenantKey sessionId 
			clients.deleteClient(cmd.sessionId)
		}

};

NotyTcpServer.prototype.dispatchCommand = function(line,socket)
{
	var querystring   	= require('querystring');   
    var cmd = querystring.parse(line);

    console.log('Got line: ' + line);
    if(cmd.cmd ==null)
    {
    	console.log('Got one wrong line: ' + line );
        
    }
    else
    {
    	if(cmd.cmd == "client")
    	{
    		console.info("New client "+cmd.sessionId+"/"+cmd.user);
    		clients.addClient(cmd.sessionId,socket,cmd.user);
    		return ;
    	}
    	else if(!clients.validClient(cmd.sessionId))
    	{
    		console.log("Wrong session! Command should be ignored \n" + cmd.sessionId);
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