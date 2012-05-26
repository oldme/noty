(c) Axiologic SaaS SRL
License: GPL (version 3)

Status:
  - first commits,work in progress

What is Noty?
 	For now, Noty is a notification server created with node.js. 
 	Noty could be used for cloud and non cloud applications as is intended to be quite simple and scalable. 
 	This server is created with Axiologic Quark framework architecture in mind but it is quite generic and
 	could be used in other places as well.
 	
    
How it works?
	The data/persistence layer is sending to Noty informations about what objects a client want to be notified 
at changes (usually select queries results in a data layer)  and also informations about updated objects. 
Noty is sending to it's clients simple notifications and the client is responsible of requesting from the server 
the changed objects. Noty doesn't know the content of any object and is using session keys to identify properly 
authenticated clients. 
     Clients that are not properly authenticated can at their best just decrease some resources on server but they 
will not learn much about system activity because they will not get notified without knowing a real session key.

Protocol:
 All commands get read in a query format lines like in this example:  cmd=persistence&appKey=value&sessionId=value&... 

 The keys used in queries are listed below:
 
 * for communications between server/persistence and Noty
// persistence 	secretToken appKey sessionId 
 update 		secretToken appKey sessionId table id
 delete 		secretToken appKey sessionId table id
 new 			secretToken appKey sessionId table id
 follows 		secretToken appKey sessionId table id1-id2,id3-id4,id5
 notifyNew 		secretToken appKey sessionId table secretToken
 logout 		secretToken appKey sessionId 


 * for communications between client and Noty
  client 		appKey sessionId userName 
  clientLogout  socket

 * The client will get lines likes:
 change 		table  id 		 new|update|delete

 */


Requirements:
 - node.js
 	/* interesting,but i miss not having proper OOP as in C++,Java,Action Script :) */
 - module: carrier (nmp install carrier) 
 	/* module that helps working with text protocols, the socket  sends an event at each new line read. Great! */
 

IDE configuration
 - VJET plugin
 - NodejsTL : https://www.ebayopensource.org/wiki/display/VJET/Importing+VJET+JavaScript+Type+Libraries