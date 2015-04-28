$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session;

$.import("sap.hana.xs.libs.dbutils", "procedures");
var XSProc = $.sap.hana.xs.libs.dbutils.procedures;
XSProc.setTempSchema($.session.getUsername().toUpperCase()); 

function getAddressesByRole() {
	
	var partnerRole = $.request.parameters.get("PartnerRole").toUpperCase();
	var conn = $.db.getConnection();

//********************************************
//     Call procedure using the connection API
//********************************************
//	var cst = conn.prepareCall('CALL SAP_HANA_EPM_NEXT."sap.hana.democontent.epmNext.procedures::get_bp_addresses_by_role"(?,?)');
//	cst.setString(1, partnerRole);
//	cst.execute();
//	var rs = cst.getResultSet( );
//	var jsonOut = SESSIONINFO.recordSetToJSON(rs, 'EX_BP_ADDRESSES');
//	cst.close();	
//	conn.close();
	
//*********************************************
//     Call procedure using the xsProcedure API
//*********************************************
	var getBpAddressesByRole = XSProc.procedureOfSchema("SAP_HANA_EPM_NEXT", 
           "sap.hana.democontent.epmNext.procedures::get_bp_addresses_by_role"); 
    var results = getBpAddressesByRole( { IM_PARTNERROLE: partnerRole}, conn );
    var jsonOut = results;   //You can reference the output parameter directly as well ... results.EX_BP_ADDRESSES
    conn.close();
		

// Pass output to response		
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(jsonOut));
}


var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getAddressesByRole":
	getAddressesByRole();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('Invalid Request Method');
}