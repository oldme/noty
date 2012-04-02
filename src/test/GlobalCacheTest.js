var cacheModule   = require('../GlobalCache.js');
var clientsModule = require('../clientList.js');
var assert 		  = require('assert');

var clients		  = clientsModule.getClientList();
var cache		  = cacheModule.getGlobalCache(clients.validClient);

//subscribe = function (appNameKey, tableName, ranges, sessionId) 
//onUpdate = function (appNameKey, tableName, id, updaterSessionId, notifyFunction)
//onDelete = GlobalCache.prototype.onUpdate;
//onNew = function (appNameKey, tableName, id, creatorSessionId, notifyFunction) 


function mkDontCallMeUpdate(app,table,id,session)
{
	var myApp 	= app;
	var table 	= table;
	var id 		= id;
	var session = session;	
	cache.onUpdate(myApp,table,id,session,
				function (session,table,id)
				{			
					assert.equal(true,false,"Update notification failed for " + myApp + "/" + table + "/"+id + " in session "+ session);
				}
			);
	
};

var callCounter = new Object();

function mkCall(app,table,id,session)
{
	return "Call:"+app+table+id+session;
}

function registerRequiredCall(app,table,id,session)
{
	callCounter[mkCall(app,table,id,session)]++;
}

function doRequiredCall(app,table,id,session)
{
	var call = mkCall(app,table,id,session);
	if(callCounter[call]<=0)
	{
		assert.equal(true,false,"Wrong call for " + app + "/" + table + "/"+id + " and session "+ session);
	}
	callCounter[call]--;
}

function mkCallMeUpdate(app,table,id,session,session1,session2,session3)
{
	var myApp 	= app;
	var myTable 	= table;
	var myId 		= id;
	var session0 = session;
	var session1 = session1;
	var session2 = session2;
	var session3 = session3;
	
	if(session1 != null) registerRequiredCall(myApp,myTable,myId,session1);
	if(session2 != null) registerRequiredCall(myApp,myTable,myId,session2);
	if(session3 != null) registerRequiredCall(myApp,myTable,myId,session3);
	
	cache.onUpdate(myApp,table,id,session,
				function (app,session,table,id)
				{					
					doRequiredCall(app,table,id,session);
					if(session != session1 && session != session2 && session != session3)
					{
						assert.equal(true,false,"False notification for " + myApp + "/" + table + "/"+id + " in session "+ session);
					}					
				}
			);
	
};


cache.subscribe("app1","table1","1",'session1');
cache.subscribe("app1","table1","10-100",'session1');
cache.subscribe("app1","table1","101-102,200-300,500-10000",'session1');
cache.subscribe("app1","table1","101-102,203-300,500-10000",'session2');
cache.subscribe("app1","table1","101-102,203-300,500-10000",'session3');


mkDontCallMeUpdate("app1","table1",1,'session1');
mkDontCallMeUpdate("app2","table1",1,'session2');
mkDontCallMeUpdate("app1","table2",1,'session2');
mkDontCallMeUpdate("app1","table2",1,'session2');
mkDontCallMeUpdate("app1","table1",2,'session1');
mkDontCallMeUpdate("app1","table1",2,'session2');

mkDontCallMeUpdate("app1","table1",110,'session1');
mkDontCallMeUpdate("app1","table1",110,'session2');
mkDontCallMeUpdate("app1","table1",110,'session3');
mkDontCallMeUpdate("app1","table1",110,'session5');


mkDontCallMeUpdate("app1","table1",20000,'session1');
mkDontCallMeUpdate("app1","table1",20000,'session2');
mkDontCallMeUpdate("app1","table1",20000,'session3');
mkDontCallMeUpdate("app1","table1",20000,'session5');


mkCallMeUpdate("app1","tale1",101,"session3","session1","session2",null);
mkCallMeUpdate("app1","tale1",101,"session5","session1","session2","session3");
mkCallMeUpdate("app1","tale1",203,"session3","session1","session2",null);
mkCallMeUpdate("app1","tale1",203,"session5","session1","session2","session3");
mkCallMeUpdate("app1","tale1",204,"session3","session1","session2",null);
mkCallMeUpdate("app1","tale1",204,"session5","session1","session2","session3");
mkCallMeUpdate("app1","tale1",10000,"session3","session1","session2",null);
mkCallMeUpdate("app1","tale1",10000,"session5","session1","session2","session3");


