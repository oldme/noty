(c) Axiologic SaaS SRL
License: GPL (version 3)

What is Noty?
 	For now, Noty is a notification server created with node.js. 
 	Noty could be used for cloud and non cloud applications. It is intended to be quite generic,simple and scalable.
 	This server is created with Axiologic Quark framework architecture in mind but it is quite generic and
 	could be used in other places as well.
 	
    
How it works?
	- The data/persistence layer is sending messages to Noty about what objects got changed.
	An object is identified by a table name and an id.
	- clients are subscribing to ranges of objects or specific objects
	- Noty is sending to clients notifications but  Noty doesn't know the content of any object and is
	using session keys to identify properly authenticated clients. Clients will query the persistence layer or a cache
	to get the real object.


Protocol:
    All commands get read in a query format lines like in this example:
    cmd=persistence&appKey=value&sessionId=value&...
    Check the unit tests for details about the protocol.


Dependencies:
 Modules: "carrier" (nmp install carrier)
 	/* module that helps working with text protocols, the socket is sending an event at each new line. Great! */
        "querystring"
