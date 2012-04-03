/*
 * 
 * (c) Axiologic SaaS SRL
*/


exports.getClientList = function()
{
	if(ClientList.prototype.instance == null)
	{
		ClientList.prototype.instance = new ClientList();
	}
	return ClientList.prototype.instance;
}

ClientList.prototype.instance = null;

function ClientList()
{
	this.clients = new Object();
}

function hasOwn(object, property) 
{ 
	return Object.prototype.hasOwnProperty.call(object, property); 
} 

//return a boolean
ClientList.prototype.validClient = function(clientId)
{
	
	if(hasOwn(this,clientId))
	{
		return false;
	}
	return true;
}

ClientList.prototype.addClient = function(clientId,socket)
{
	this.clients[clientId] = socket;
}


ClientList.prototype.deleteClient = function(clientId)
{
	delete this.clients[clientId];
}