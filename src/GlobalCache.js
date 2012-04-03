/*
 * 
 * (c) Axiologic SaaS SRL
*/


exports.getGlobalCache = function(validObserverFunction)
{

 if(validObserverFunction != null) 
	 {
		 GlobalCache.prototype.validObserverFunction = validObserverFunction;
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

GlobalCache.prototype.validObserverFunction = null;
GlobalCache.prototype.instance = null;

GlobalCache.prototype.getTableCache = function (appNameKey, tableName)
{	
	var ac = this.globalCache[appNameKey];  //application cache
	if(ac == null)
	{
		ac = new AppCache();
		this.globalCache[appNameKey] = ac;
	}

	var tc = ac[tableName];  //table cache
	if(tc == null)
	{
		tc = new TableCache();
		ac[tableName] = tc;
	}
	return tc;
};



function AppCache()
{
	
	this.tables = new Array();
}



function TableCache(tableName) //construct an object to keep ObjectObservers in object
{	
	this.objects = new Array();
	this.newObservers = new Object();
	this.tableName = tableName;
}


function ObjectObservers(table,objectId) //constructor for an object that keeps a list with current observers for a table row
{	
	this.observers 	= new Object();
	this.table 		= table;
	this.objectId 	= objectId;
}

//shared variables for all calls...
var forDelete = new Array();
		
//notify all oservers,the session causing the change don't get notified
ObjectObservers.prototype.notify = function(updaterSessionId,notifyFunction)
	{		
		var i=null;
		for (i in this.observers)
		{
			if(!GlobalCache.prototype.validObserverFunction(i))		
			{
				forDelete.push(i);
			}
			else if(i != updaterSessionId)
			{
				notifyFunction(i,this.table,this.objectId);
			}
		}
		
		for (i in forDelete )
		{
			delete this.observers[i]; //sort of lazy garbage collection..  
		}
		forDelete.length=0;//clear
	};
	
ObjectObservers.prototype.subscribe = function(updaterSessionId)
{
	this.observers[updaterSessionId] = updaterSessionId;
};

GlobalCache.prototype.subscribe = function (appNameKey, tableName, ranges, sessionId) 
{
		var tc = this.getTableCache(appNameKey, tableName);	
		tc.subscribe(ranges, sessionId);
};


TableCache.prototype.getObjectObserver = function (id)
{	
	var oo = this.objects[id];
	if(oo == null)
	{
		oo = new ObjectObservers(this.tableName,id);
		this.objects[id] = oo;
	}
	return oo;
};


TableCache.prototype.subscribeSingleRange = function(value,sessionId)
{
	var r = value.split("-");
	var len=r.length;
	var oo;
	if(len==2)
	{
		for(var j=r[0];j<r[1];j++)
		{
			oo = this.getObjectObserver(j);
			oo.subscribe(sessionId);
		}
	}
	else
	{
		oo = this.getObjectObserver(value);
		oo.subscribe(sessionId);
	}

}

TableCache.prototype.subscribe = function(ranges,sessionId)
{
	var arr = ranges.split(",");
	var len=arr.length;
	var i;
	for(i=0; i<len; i++) 
	{
		this.subscribeSingleRange(arr[i],sessionId);		
	}
};


GlobalCache.prototype.onUpdate = function (appNameKey, tableName, id, updaterSessionId, notifyFunction) 
{
	var tc = this.getTableCache(appNameKey, tableName);
	var oo = tc.getObjectObserver(id);	
	oo.notify(updaterSessionId,notifyFunction);
};


GlobalCache.prototype.onDelete = GlobalCache.prototype.onUpdate;

GlobalCache.prototype.onNew = function (appNameKey, tableName, id, creatorSessionId, notifyFunction) 
{
	var tc = this.getTableCache(appNameKey, tableName);
	tc.newObservers.notify(creatorSessionId,notifyFunction);
};

