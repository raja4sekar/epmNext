
var rfc2abap = $.import("sap.hana.democontent.epmNext.services", "rfc2abap");

var user = $.request.parameters.get("username");
var rfcName = 'Z_BAPI_USER_GET_DETAIL';
var dest = $.net.http.readDestination('sap.hana.democontent.epmNext.services', 'rfc2abap');
var client = new $.net.http.Client();

var rfcParams = rfc2abap.getParamsForRfc(dest,client,rfcName);
var rfcRequest = rfc2abap.getRfcRequest(dest,client,'HPM','001');
//
//rfcParams.PARAMS.USERNAME = user;
//var requestBody = 
//              {rpc:    '2.0',
//		       method: rfcName,		   
//		       id:     1};
//requestBody.params = rfcParams.PARAMS ;
//
//
//rfcRequest.setBody(JSON.stringify(requestBody));
//client.request(rfcRequest, dest);
// 
//var rfcResponse = client.getResponse();
//$.response.contentType ='application/json'; 
//$.response.setBody(rfcResponse.body.asString());
//
