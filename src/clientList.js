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

//return a boolean
ClientList.prototype.validClient = function(clientId)
{
	if(this.clients[clientId] != null)
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
	this.clients[clientId] = null;
}