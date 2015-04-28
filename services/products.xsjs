$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session;

$.import("sap.hana.xs.libs.dbutils", "procedures");
var XSProc = $.sap.hana.xs.libs.dbutils.procedures;
XSProc.setTempSchema($.session.getUsername().toUpperCase());


function getProductsById() {

//  ProductId list is hardcoded here, but also possible to pass values 
//  in the body of the request as JSON object.
//	var productIds = $.request.body.asString();
	var productIds = [
	        	      { PRODUCTID: 'HT-1000' }, 
	                  { PRODUCTID: 'HT-1101' },
	        	      { PRODUCTID: 'HT-6123' },
	                  { PRODUCTID: 'HT-8000' }
	        	     ];		
	var conn = $.db.getConnection();

//*****************************************
//  Call procedure using the connection API
//*****************************************
//    conn.prepareStatement('create LOCAL TEMPORARY TABLE #t_product_ids like ' + 
//    		              '"SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::EPM.Procedures.tt_product_ids"').execute();
//
//    var ps = conn.prepareStatement("INSERT INTO #t_product_ids VALUES(?)"); 
//    productIds.forEach(function(e) {
//        ps.setNString(1, e.PRODUCTID);
//        ps.execute();
//    });   
//    
//	var cst = conn.prepareCall('CALL SAP_HANA_EPM_NEXT."sap.hana.democontent.epmNext.procedures::get_products_by_id"(#t_product_ids,?)');
//	cst.execute();
//	var rs = cst.getResultSet( );
//	var jsonOut = SESSIONINFO.recordSetToJSON(rs, 'EX_PRODUCTS');
//
//    conn.prepareStatement("drop table #t_product_ids").execute();	
//	
//	ps.close();	
//	cst.close();
//	conn.close();

//*********************************************
//     Call procedure using the xsProcedure API
//*********************************************
	  var getProductsById = XSProc.procedureOfSchema("SAP_HANA_EPM_NEXT", 
            "sap.hana.democontent.epmNext.procedures::get_products_by_id"); 
      var results = getProductsById( productIds, conn );
      var jsonOut = results;   //You can reference the output parameter directly as well ... results.EX_PRODUCTS
      conn.close();
	
	
// Pass output to response	
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(jsonOut));
}


var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getProductsById":
	getProductsById();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('Invalid Request Method');
}