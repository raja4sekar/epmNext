$.import("sap.hana.xs.libs.dbutils", "xsds");
var XSDS = $.sap.hana.xs.libs.dbutils.xsds;

	var oEmployee = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.Employees");
	var employee = oEmployee.$find({ LOGINNAME: "EPM_USER" });
	
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(employee));