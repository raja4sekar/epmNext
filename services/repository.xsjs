/**
@author i809764 
**/

$.import("sap.hana.xs.libs.dbutils","xsds");
var XSDS = $.sap.hana.xs.libs.dbutils.xsds;

var conn = $.hdb.getConnection();
var pstmt1;

/**  
@function Outputs the Session user and Language as JSON in the Response body
*/
function fillSessionInfo(){
	var body = '';
	body = JSON.stringify({
		"session" : [{"UserName": $.session.getUsername(), "Language": $.session.language}] 
	});
	$.response.contentType = 'application/json'; 
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}

function getObject(){
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('No longer implemented on the server. Please use the DT REST interface call instead');
	
}


/**
@function Puts a JSON object into the Response Object
@param {object} jsonOut - JSON Object
*/
function outputJSON(jsonOut){
	var out = [];
	for(var i=0; i<jsonOut.length;i++){
		out.push(jsonOut[i]);
	}
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(out));
}

/**
@function Utility to build error message response
@param {string} input - Error message text
*/
function outputError(errorString){
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.contentType = "text/plain";
	$.response.setBody(errorString);	
}



function getPackages(){
	var searchPackage = $.request.parameters.get("package");
	if (typeof searchPackage === 'undefined') {
		searchPackage = "%";
	} else {
		searchPackage += "%";
	}
	
	var query = 'SELECT TOP 200 "PACKAGE_ID" FROM "_SYS_REPO"."PACKAGE_CATALOG" '+
	            '   WHERE "PACKAGE_ID" LIKE ? ORDER BY "PACKAGE_ID" ';
	var jsonOut = conn.executeQuery(query,searchPackage);
	outputJSON(jsonOut);
	
}

function getObjList(){
	var searchPackage = $.request.parameters.get("package");
	var objName = $.request.parameters.get("obj");
	if (typeof objName === 'undefined') {
		objName = "%";
	} else {
		objName += "%";
	}
	var query = 'SELECT TOP 200 DISTINCT "OBJECT_NAME" FROM "_SYS_REPO"."ACTIVE_OBJECT" '+
	            ' WHERE "PACKAGE_ID" = ? and "OBJECT_NAME" LIKE ? ORDER BY LOWER("OBJECT_NAME")';
	var jsonOut = conn.executeQuery(query, searchPackage, objName);
    outputJSON(jsonOut);
	
}

function getExtList(){
	var searchPackage = $.request.parameters.get("package");
	var objName = $.request.parameters.get("obj");
	if (typeof objName === 'undefined') {
		objName = "%";
	} else {
		objName += "%";
	}

	var query = 'SELECT TOP 200 DISTINCT "OBJECT_SUFFIX" FROM "_SYS_REPO"."ACTIVE_OBJECT" '+
	            ' WHERE "PACKAGE_ID" = ? and "OBJECT_NAME" LIKE ? ORDER BY LOWER("OBJECT_SUFFIX")';
	var jsonOut = conn.executeQuery(query,searchPackage,objName);
    outputJSON(jsonOut);
}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getObject":
    getObject();
    break;
case "getSessionInfo":
	fillSessionInfo();
	break; 
case "getPackages":
	getPackages();
	break;
case "getObjList":
	getObjList();
	break;
case "getExtList":
	getExtList();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('Invalid Request Method');
}