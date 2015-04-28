$.import("sap.hana.democontent.epmNext.services", "messages");
var MESSAGES = $.sap.hana.democontent.epmNext.services.messages;
$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session; 

function getFilter() {
	function createFilterEntry(rs, attribute, obj) {
		return {
			"terms" : rs.TERMS,
			"attribute" : attribute,
			"category" : obj
		};
	}

	var body = '';
	var terms = $.request.parameters.get('query');
	var termList = terms.split(" ");
	var termStr = "";
	var i;
	for (i = 0; i < termList.length; i++) {
		termStr += termList[i].replace(/\s+/g, '') + "* ";
	}
	terms = termStr;

	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var query;
	var list = [];

	try {
		// Business Partner Company Name
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(COMPANYNAME) AS TERMS FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.BusinessPartner" '
				+ ' WHERE CONTAINS(COMPANYNAME,?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'001'), "PARTNERID"));
		}

		// Business Partner City
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("CITY") AS TERMS FROM "sap.hana.democontent.epmNext.models::BUYER" '
				+ ' WHERE CONTAINS("CITY",?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'007'), "businessPartner"));
		}

		// Product - Product Category
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(CATEGORY) AS TERMS FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" '
				+ 'WHERE CONTAINS(CATEGORY,?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'008'), "businessPartner"));
		}

		// Product - Product ID
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PRODUCTID) AS TERMS FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" '
				+ 'WHERE CONTAINS(PRODUCTID,?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'009'), "products"));
		}

		// Product - Product Name
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("Product_Name") AS TERMS FROM "sap.hana.democontent.epmNext.models::PRODUCT" '
				+ 'WHERE CONTAINS("Product_Name",?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'010'), "products"));
		}

		// Product - Product Desc
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("Product_Description") AS TERMS FROM "sap.hana.democontent.epmNext.models::PRODUCT" '
				+ 'WHERE CONTAINS("Product_Description",?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'011'), "products"));
		}

		// PO - PO ID
		query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PURCHASEORDERID) AS TERMS FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.Header" '
				+ 'WHERE CONTAINS(PURCHASEORDERID,?)';
		rs = conn.executeQuery(query,terms);
		for(var i = 0; i < rs.length; i++){
			list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
					'012'), "purchaseOrder"));
		}
		conn.close();
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}
	body = JSON.stringify(list);
	$.trace.debug(body);
	$.response.contentType = 'application/json';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}

function getTotalOrders() {
	function createTotalEntry(rs) {
		return {
			"name" : rs.NAME,
			"value" : rs.VALUE
		};
	}

	var body = '';
	var ivGroupBy = $.request.parameters.get('groupby');
	var ivCurrency = $.request.parameters.get('currency');
	var list = [];

	switch (ivGroupBy) {
	case "COMPANYNAME":
		break;
	case "CATEGORY":
		break;
	case "CITY":
		break;
	case "POSTALCODE":
		break;
	case "PRODUCTID":
		break;
	default:
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '000', ivGroupBy));
		return;
	}
	if (ivCurrency === null) {
		ivCurrency = "USD";
	}
	ivCurrency = ivCurrency.substring(0, 3);

	try {
		var query = 'SELECT top 5 "'
				+ ivGroupBy
				+ '" AS NAME, SUM("CONVGROSSAMOUNT") AS VALUE FROM "sap.hana.democontent.epmNext.models::PURCHASE_COMMON_CURRENCY" (\'PLACEHOLDER\' = (\'$$IP_O_TARGET_CURRENCY$$\', \''
				+ ivCurrency + '\')) group by "' + ivGroupBy
				+ '" order by sum("CONVGROSSAMOUNT") desc';
		$.trace.debug(query);
		var conn = $.hdb.getConnection();
		var rs = conn.executeQuery(query);
		for(var i = 0; i < rs.length; i++){
			list.push(createTotalEntry(rs[i]));
		}
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}

	body = JSON.stringify({
		"entries" : list
	});

	$.response.contentType = 'application/json; charset=UTF-8';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}

function downloadExcel() {
	var body = '';

	try {
		var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" '
				+ 'FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.HeaderView" order by "PurchaseOrderId"';
		$.trace.debug(query);
		var conn = $.hdb.getConnection();
		var rs = conn.executeQuery(query);

		body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
																	// Order ID
		MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
		MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
		MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
															// Responsible
		MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
		MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

		for(var i = 0; i < rs.length; i++){
			body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t"
					+ rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t"
					+ rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
		}
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}

	$.response.setBody(body);
	$.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
	$.response.headers.set('Content-Disposition',
			'attachment; filename=Excel.xls');
	$.response.status = $.net.http.OK;

}


//Zip Functionality
function downloadZip() {
	var body = '';

	try {
		
		var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" '
			+ 'FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.HeaderView" order by "PurchaseOrderId"';
		$.trace.debug(query);
		var conn = $.hdb.getConnection();
		var rs = conn.executeQuery(query);

		body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
																	// Order ID
		MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
		MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
		MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
															// Responsible
		MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
		MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

		for(var i = 0; i < rs.length; i++){
			body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t"
					+ rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t"
					+ rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
		}
		
		var zip = new $.util.Zip();
		zip["Excel.xls"] = body;
		
		$.response.status = $.net.http.OK;
		$.response.contentType = "application/zip";
		$.response.headers.set('Content-Disposition', "attachment; filename = Purchase.zip");
		$.response.setBody(zip.asArrayBuffer());
		
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}


}


//end of zip

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "filter":
	getFilter();
	break;
case "getTotalOrders":
	getTotalOrders();
	break;
case "Excel":
	downloadExcel();
	break;
case "getSessionInfo":
	SESSIONINFO.fillSessionInfo();
	break;
case "Zip":
	downloadZip();
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}