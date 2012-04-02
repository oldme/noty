var cacheModule   = require('./GlobalCache.js');
var clientsModule = require('./clientList.js');
var assert 		  = require('assert');

var clients		  = clientsModule.getClientList();
var cache		  = cacheModule.getGlobalCache(clients.validClient);

//subscribe = function (appNameKey, tableName, ranges, sessionId) 
//onUpdate = function (appNameKey, tableName, id, updaterSessionId, notifyFunction)
//onDelete = GlobalCache.prototype.onUpdate;
//onNew = function (appNameKey, tableName, id, creatorSessionId, notifyFunction) 
funcion callMe()
{
	
}

funcion dontCallMe()
{
	
}

cache.subscribe("app1","table1","1",'session1');
cache.subscribe("app1","table1","3-100",'session1');
cache.subscribe("app1","table1","101-102,103-200,500-10000",'session1');

cache.onUpdate("app1","table1",1,'session1',dontcallMe);
cache.onUpdate("app1","table1",1,'session1',dontcallMe);
