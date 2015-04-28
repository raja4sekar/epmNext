$.import("sap.hana.democontent.epmNext.services", "messages");
var MESSAGES = $.sap.hana.democontent.epmNext.services.messages;

function searchImages(){
	var search = $.request.parameters.get("search");
	var index = $.request.parameters.get("index");
	if(index === undefined){
		index = 0;
	}
	var dest = $.net.http.readDestination("sap.hana.democontent.epmNext.services", "images");
	
	var client = new $.net.http.Client();
	var req = new $.web.WebRequest($.net.http.GET, search);
	client.request(req, dest);
	
	var response = client.getResponse();

	
	var body;
	if(response.body){body = response.body.asString(); }
	$.response.status = response.status;

	if(response.status === $.net.http.INTERNAL_SERVER_ERROR){
		$.response.contentType = "application/json";		
		$.response.setBody('body');
	}
	else{
		$.response.contentType = "text/html";
		var searchDet = JSON.parse(body);
		var outBody = 
			'First Result of ' + searchDet.search.hits + '</br>'+
			'<img src="' + searchDet.results[index].image.full + '">';
		$.response.setBody( outBody );
	}	
}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {

case "Images":
	searchImages();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}