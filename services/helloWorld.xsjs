$.response.contentType = "text/html";
var output = "Hello, World! <br><br>";

var conn = $.hdb.getConnection();
var query = 'select * from DUMMY';
var rs = conn.executeQuery(query);

if (rs.length<1){
	$.response.setBody( "Failed to retieve data");
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
}
else {
	output += "This is the response from my SQL: " + rs[0].DUMMY;
	$.response.setBody(output);	
}

conn.close();