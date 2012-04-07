/*
 * 
 * (c) Axiologic SaaS SRL
*/

exports.getClientList = getClientList;


function ClientList()
{
	this.clients = new Object();
}

function hasOwn(object, property) 
{ 
	return Object.prototype.hasOwnProperty.call(object, property); 
} 

//>boolean function(int)
ClientList.prototype.validClient = function(clientId)
{	
	if(!hasOwn(ClientList.prototype.instance.clients,clientId))
	{
		
		console.log("Invalid client " + clientId);
		return false;
	}
	return true;
}

ClientList.prototype.instance = null;


ClientList.prototype.addClient = function(clientId,socket,user)
{
	var o = new Object();
	o.socket = socket;
	o.user   = user;
	this.clients[clientId] = o;
}


ClientList.prototype.deleteClient = function(clientId)
{
	delete this.clients[clientId];
}


//>ClientList getClientList()
function getClientList()
{
	if(ClientList.prototype.instance == null)
	{
		ClientList.prototype.instance = new ClientList();
	}
	return ClientList.prototype.instance;
}

