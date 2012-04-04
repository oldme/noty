function buggy10000(value)
{
	var r = value.split("-");
	var len=r.length;
	var j;
	if(len==2)
	{
		console.log("For in RANGE " + r[0]+"<-->"+r[1]);
		for(j=parseInt(r[0]);j<=parseInt(r[1]);j++)
		{
			console.log(j);
		}
	}

}

buggy10000("98-99");
buggy10000("99-100");
buggy10000("100-102");
	/*
var r=[500,10000];
var j;
for(j=r[0];j<=r[1];j++)
{
	console.log(j);
}
*/