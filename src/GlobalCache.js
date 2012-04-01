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



function TableCache() //construct an obect to keep ObjctObservers in object
{	
	this.objects = new Array();
	this.newObservers = new Object();
}

TableCache.prototype.getObjectObserver = function (id)
{	
	return this.objects[id];
};


function ObjectObservers() //constructor for an object that keeps a list with current observers for a table row
{	
	this.observers = new Object();
}

//shared variables for all calls...
var forDelete = new Array();
		
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
				notifyFunction(i);
			}
		}
		
		for (i in forDelete )
		{
			delete this.observers[i]; //sort of lazy garbage collection..  
		}
		forDelete.clear(); //todo check
	};
	


GlobalCache.prototype.subscribe = function (appNameKey, tableName, ranges, sessionId) 
{
		var tc = this.getTableCache(appNameKey, tableName);	
		tc.register(ranges, sessionId);
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

