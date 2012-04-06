

var clients		  = require('../clientList.js').getClientList(); //<ClientList
var cache		  = require('../GlobalCache.js').getGlobalCache(clients.validClient);

//subscribe = function (appNameKey, tableName, ranges, sessionId) 
//onUpdate = function (appNameKey, tableName, id, updaterSessionId, notifyFunction)
//onDelete = GlobalCache.prototype.onUpdate;
//onNew = function (appNameKey, tableName, id, creatorSessionId, notifyFunction) 


function assertNoCall(app,table,id,session)
{
	var myApp 	= app;
	var table 	= table;
	var id 		= id;
	var session = session;	
	cache.onUpdate(myApp,table,id,session,
				function (app,table,id,session)
				{			
					console.log("Wrong notification for " + mkCall(myApp,table,id,session));
					//assert.equal(true,false,"Update notification failed for " + myApp + "/" + table + "/"+id + " in session "+ session);
				}
			);
	
};

//in the end the number of calls should be zero
var callCounter = new Object();

function mkCall(app,table,id,session)
{
	return app+'/'+table+'/'+id+'/'+session;
}

function registerRequiredCall(app,table,id,session)
{
	var call = mkCall(app,table,id,session);
	if(!Object.prototype.hasOwnProperty.call(callCounter, call))
	{
		callCounter[call] = 0;
	}
	callCounter[call]++;
}

function doRequiredCall(app,table,id,session)
{
	var call = mkCall(app,table,id,session);
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

function assertMandatoryCall(app,table,id,session,session1,session2,session3)
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
				function (app,table,id,session){					
					doRequiredCall(app,table,id,session);
					if(session != session1 && session != session2 && session != session3){
						//assert.equal(true,false,"False notification for " + myApp + "/" + table + "/"+id + " in session "+ session);
						console.log("Unexpected notification in session for " + mkCall(myApp,table,id,session));
					}					
				}
			);
	
};

clients.addClient("session0",0);
clients.addClient("session1",1);
clients.addClient("session2",2);
clients.addClient("session3",3);
clients.addClient("session5",5);

cache.subscribe("app1","table1","1",'session1');
cache.subscribe("app1","table1","10-100",'session1');
cache.subscribe("app1","table1","101-102,200-300,500-10000",'session1');
cache.subscribe("app1","table1","101-102,203-300,500-9999,10000,10001,10002",'session2');
cache.subscribe("app1","table1","101-102,203-300,500-9999,10000,10001-10002,20001-1000000",'session3');



assertNoCall("app1","table1",1,'session1');
assertNoCall("app2","table1",1,'session2');
assertNoCall("app1","table2",1,'session2');
assertNoCall("app1","table2",1,'session2');
assertNoCall("app1","table1",2,'session1');
assertNoCall("app1","table1",2,'session2');

assertNoCall("app1","table1",110,'session1');
assertNoCall("app1","table1",110,'session2');
assertNoCall("app1","table1",110,'session3');
assertNoCall("app1","table1",110,'session5');


assertNoCall("app1","table1",20000,'session1');
assertNoCall("app1","table1",20000,'session2');
assertNoCall("app1","table1",20000,'session3');
assertNoCall("app1","table1",20000,'session5');

assertNoCall("app1","table1",100000,'session3');


assertMandatoryCall("app1","table1",101,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",101,"session5","session1","session2","session3");
assertMandatoryCall("app1","table1",203,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",203,"session5","session1","session2","session3");
assertMandatoryCall("app1","table1",204,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",204,"session5","session1","session2","session3");

assertMandatoryCall("app1","table1",299,"session5","session1","session2","session3");
assertMandatoryCall("app1","table1",300,"session5","session1","session2","session3");

assertMandatoryCall("app1","table1",500,"session1","session2","session3",null);
assertMandatoryCall("app1","table1",500,"session2","session1","session3",null);
assertMandatoryCall("app1","table1",500,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",500,"session4","session1","session2","session3");

assertMandatoryCall("app1","table1",9998,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",9999,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",9999,"session3","session1","session2",null);
assertMandatoryCall("app1","table1",9999,"session5","session1","session2","session3");
	

assertMandatoryCall("app1","table1",1000000,"session1","session3");

console.log("No other messages,all tests passing!\n");
//check that there are no expected but duplicated and therefore invalid calls 
for(var callName in callCounter)
{	
	if(callCounter[callName] >0)
	{
		console.log("Missing calls for " + callName +" (" + callCounter[callName]+ ')');
	}
	
	if(callCounter[callName] <0)
	{
		console.log("Unexpected calls for " + callName +" ( " + callCounter[callName] + ')');
	}
}