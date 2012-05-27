/*
 * 
 * (c) Axiologic SaaS SRL
*/


exports.getGlobalCache = function(verifyStillActiveSession)
{

 if(verifyStillActiveSession != null) 
	 {
		 GlobalCache.prototype.verifyStillActiveSession = verifyStillActiveSession;
	 }
	 
 if(GlobalCache.prototype.instance == null) 
	 {
		 GlobalCache.prototype.instance = new GlobalCache();
	 }
	 
 return GlobalCache.prototype.instance;
};


function GlobalCache()
{
	this.globalCache = new Array();		
	GlobalCache.prototype.instance = this;	
}

GlobalCache.prototype.verifyStillActiveSession = null;
GlobalCache.prototype.instance = null;

GlobalCache.prototype.getTableCache = function (tenantNameKey, tableName)
{	
	var ac = this.globalCache[tenantNameKey];  //tenantlication cache
	if(ac == null)
	{
		ac = new tenantCache();
		this.globalCache[tenantNameKey] = ac;
	}

	var tc = ac[tableName];  //table cache
	if(tc == null)
	{
		tc = new TableCache(tableName,tenantNameKey);
		ac[tableName] = tc;
	}
	return tc;
};



function tenantCache()
{
	
	this.tables = new Array();
}


//>void TableCache(String tableName,String tenant)
function TableCache(tableName,tenant) //construct an object to keep ObjectObservers in object
{	
	this.objects = new Array();
	this.newObservers = new Object();
	this.tableName = tableName;
	this.tenant = tenant;
}


function ObjectObservers(table,objectId) //constructor for an object that keeps a list with current observers for a table row
{	
	this.observers 	= new Object();
	this.table 		= table;    //<TableCache
	this.objectId 	= objectId; //<int
}

//shared variables for all calls...
var forDelete = new Array();
		
//notify all observers,the session causing the change don't get notified
ObjectObservers.prototype.notify = function(updaterSessionId,notifyFunction){		
		for (var i in this.observers){
			if(!GlobalCache.prototype.verifyStillActiveSession(i)){
				console.log("Cleaning session " + i + " for object" + this.objectId);
				forDelete.push(i);
			}
			else if(i != updaterSessionId){
				notifyFunction(this.table.tenant,this.table.tableName,this.objectId,i);
			}
		}
		
		for (var j in forDelete ){
			delete this.observers[j]; //sort of lazy garbage collection..  
		}
		forDelete.length=0;//clear
	};
	
ObjectObservers.prototype.subscribe = function(sessionId){
	//console.log("Subscribing " + sessionId + " for "+this.table.tableName+"/"+this.objectId);
	this.observers[sessionId] = sessionId;
};

GlobalCache.prototype.subscribe = function (tenantNameKey, tableName, ranges, sessionId){
		var tc = this.getTableCache(tenantNameKey, tableName);	
		tc.subscribe(ranges, sessionId);
};


TableCache.prototype.getObjectObserver = function (id){	
	var oo = this.objects[id];
	if(oo == null){
		oo = new ObjectObservers(this,id);
		this.objects[id] = oo;
	}
	return oo;
};


TableCache.prototype.subscribeSingleRange = function(value,sessionId){
	var r = value.split("-");
	var len=r.length;
	var oo;
	var j;
	if(len==2){
		//console.log("Subscribing RANGE " + sessionId + " for "+this.tableName+"/"+r[0]+" "+r[1]);

		for(j=parseInt(r[0]);j<=parseInt(r[1]);j++){
			oo = this.getObjectObserver(j);
			oo.subscribe(sessionId);
		}
	}
	else{
		oo = this.getObjectObserver(value);
		oo.subscribe(sessionId);
	}

}

TableCache.prototype.subscribe = function(ranges,sessionId){
	var arr = ranges.split(",");
	var len=arr.length;
	//console.log("Found for " + ranges + " " +len);
	for(var i=0; i<len; i++){
		//console.log("Subscribing " + ranges + " " +len);
		this.subscribeSingleRange(arr[i],sessionId);		
	}
	//console.log("When subscribing "+ ranges + "/"+sessionId + " in 500 we have "+ this.objects[101]);
};


GlobalCache.prototype.onUpdate = function (tenantNameKey, tableName, id, updaterSessionId, notifyFunction){
	var tc = this.getTableCache(tenantNameKey, tableName);
	var oo = tc.getObjectObserver(id); 
	//console.log(oo.observers);
	oo.notify(updaterSessionId,notifyFunction);
};


GlobalCache.prototype.onDelete = GlobalCache.prototype.onUpdate;

GlobalCache.prototype.onNew = function (tenantNameKey, tableName, id, creatorSessionId, notifyFunction){
	var tc = this.getTableCache(tenantNameKey, tableName);
	tc.newObservers.notify(creatorSessionId,notifyFunction);
};

