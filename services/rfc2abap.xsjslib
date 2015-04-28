function getRfcRequest(dest,client,abapSid,abapClient){
	
	var endpoint = '/sap/gw/jsonrpc';
	var sessionId = 'SAP_SESSIONID_' + abapSid + '_' + abapClient;
	//Get CSRF Token
	var data = getCSRFToken(dest, client, endpoint, sessionId);
	var sap_session = data.sap_session;
	var csrf_token = data.csrf_token;

	 
	// Here comes the essential part:
	var rfcRequest = new $.web.WebRequest($.net.http.POST, endpoint );
	rfcRequest.headers.set('Content-Type', 'application/json' );
	
	if (csrf_token){
	rfcRequest.headers.set('X-CSRF-Token', csrf_token );
	} 
	if ( sap_session ){ 
	rfcRequest.cookies.set(sessionId, sap_session );
	}
	
	return rfcRequest;
}

function getRfcMetaRequest(dest,client,query){
	
	var endpoint = '/sap/gw/jsonrpc/' + '?' + query ;
	var rfcMetaRequest = new $.web.WebRequest($.net.http.GET, endpoint );
	rfcMetaRequest.headers.set('Content-Type', 'application/json' );
	return rfcMetaRequest;
}

function getParamsForRfc(dest,client,rfcName){
	
	var rfcMetaRequest = getRfcMetaRequest(dest,client,'fn='+rfcName);
	client.request(rfcMetaRequest, dest);
	var rfcResponse = client.getResponse();
	var Params =  JSON.parse(rfcResponse.body.asString()); 
	return Params;
}

function getCSRFToken(dest, client, endpoint,sessionId){
	var xs_session = $.request.cookies.get('XS-Session');
	var sap_session;
	var csrf_token;
	
	//Only works if using SSO between XS and ABAP
	var mysapsso2 = $.request.cookies.get('MYSAPSSO2');
	 
	//if ( !xs_session ) {
	 
	//var loginRequest = new $.web.WebRequest($.net.http.get, endpoint +'/login?stateful=true');
	var loginRequest = new $.web.WebRequest($.net.http.GET, '/sap/public/ping');
	loginRequest.headers.set('X-CSRF-Token', 'Fetch' );
	
	//If we have an SSO Ticket send it to ABAP
	if(mysapsso2){	loginRequest.cookies.set('MYSAPSSO2', mysapsso2 ); }

	client.request(loginRequest, dest);
	var loginResponse = client.getResponse();
	//$.response.setBody(loginResponse.body.asString());

	
//	var data = JSON.parse(loginResponse.body.asString());
	sap_session = loginResponse.cookies.get(sessionId);
	csrf_token = loginResponse.cookies.get('X-CSRF-Token');
	$.response.setBody(csrf_token);
	
//	csrf_token = data.headers['X-CSRF-Token'];
//	$.response.cookies.set('XS-Session', csrf_token + '!' + sap_session );
	
	
	
	
	//} else {
	//var part = xs_session.split('!');
	//    csrf_token = part[0];
	//    sap_session = part[1];
	//};
    return {csrf_token: csrf_token, sap_session: sap_session};

};
