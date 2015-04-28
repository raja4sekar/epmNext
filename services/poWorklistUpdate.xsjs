$.import("sap.hana.democontent.epmNext.services", "messages");
var MESSAGES = $.sap.hana.democontent.epmNext.services.messages; 

function deletePO() {
	var body = '';
	var purchaseOrderID = $.request.parameters.get('PurchaseOrderId');
	if (purchaseOrderID === null) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '012'));
		return;
	}

	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var query;
	var list = [];

	try {
		// Read Current Status for PO
		query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS '
				+ 'from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.Header" where PURCHASEORDERID = ?';
		rs = conn.executeQuery(query,purchaseOrderID);
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}

	if (rs.length<1) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '013',
				purchaseOrderID)); // Invalid purchase order number specified
		return;
	}

	// If Lifecycle is Closed; can't delete
	if (rs[0].LIFECYCLESTATUS === "C") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '014')); // Closed
		// purchase
		// orders
		// can
		// not
		// be
		// deleted
		return;
	}

	// If Lifecycle is Cancelled; can't delete
	if (rs[0].LIFECYCLESTATUS === "X") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '015',
				purchaseOrderID)); // Purchase Order &1 has already been
		// deleted
		return;
	}

	// If Approval is Approved; can't delete
	if (rs[0].APPROVALSTATUS === "A") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '016')); // Approved
		// Purchase
		// Orders
		// can
		// not
		// be
		// deleted
		return;
	}

	// If Confirmed is Confirmed; can't delete
	if (rs[0].CONFIRMSTATUS === "C") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '017')); // Confirmed
		// Purchase
		// Orders
		// can
		// not
		// be
		// deleted
		return;
	}

	// If Confirmed is Sent; can't delete
	if (rs[0].CONFIRMSTATUS === "S") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '018')); // Confirmed
		// Purchase
		// Orders
		// which
		// have
		// been
		// sent
		// to
		// the
		// partner
		// can
		// not
		// be
		// delete
		return;
	}

	// If Delivered; can't delete
	if (rs[0].ORDERINGSTATUS === "D") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '019')); // Delivered
		// Purchase
		// Orders
		// can
		// not
		// be
		// deleted
		return;
	}

	// If Invoiced; can't delete
	if (rs[0].INVOICINGSTATUS === "D") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '020')); // Invoiced
		// Purchase
		// Orders
		// can
		// not
		// be
		// delete
		return;
	}

	try {
		// Update Purchase Order Status in order to delete it
		query = "UPDATE \"SAP_HANA_EPM_NEXT\".\"sap.hana.democontent.epmNext.data::PO.Header\" set LIFECYCLESTATUS = 'X' where PURCHASEORDERID = ?";
		var iRows = conn.executeUpdate(query,purchaseOrderID);
		conn.commit();
		conn.close();
	} catch (error) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(error.message);
		return;
	}

	body = MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
	$.trace.debug(body);
	$.response.contentType = 'application/text';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;

}

function approvePO() {
	var body = '';
	var purchaseOrderID = $.request.parameters.get('PurchaseOrderId');
	if (purchaseOrderID === null) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '012')); // No
		// purchase
		// order
		// specified
		return;
	}
	var action = $.request.parameters.get('Action');
	if (action === null) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '022')); // No
		// Purchase
		// Order
		// Action
		// Supplied
		return;
	}

	switch (action) {
	case "Reject":
		break;
	case "Accept":
		break;
	default:
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '023', action)); // Action
		// &1
		// is
		// an
		// invalid
		// choice
		return;
	}
	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var query;
	var list = [];

	try {
		// Read Current Status for PO
		query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS '
			+ 'from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.Header" where PURCHASEORDERID = ?';
		rs = conn.executeQuery(query,purchaseOrderID);


	if (rs.length<1) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '013',
				purchaseOrderID)); // Invalid purchase order number specified
		return;
	}

	// If Lifecycle is Closed; can't approve or reject
	if (rs[0].LIFECYCLESTATUS === "C") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '024')); // Closed
																		// purchase
																		// orders
																		// can
																		// not
																		// be
																		// accepted
																		// or
																		// rejected
		return;
	}

	// If Lifecycle is Cancelled; can't delete
	if (rs[0].LIFECYCLESTATUS === "X") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '025')); // Deleted
																		// purchase
																		// orders
																		// can
																		// not
																		// be
																		// accepted
																		// or
																		// rejected
		return;
	}

	// If Confirmed is Confirmed; can't delete
	if (rs[0].CONFIRMSTATUS === "C") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '026')); // Confirmed
																		// Purchase
																		// Orders
																		// can
																		// not
																		// be
																		// rejected
		return;
	}

	// If Confirmed is Sent; can't delete
	if (rs[0].CONFIRMSTATUS === "S") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '027')); // Confirmed
																		// Purchase
																		// Orders
																		// which
																		// have
																		// been
																		// sent
																		// to
																		// the
																		// partner
																		// can
																		// not
																		// be
																		// rejected
		return;
	}

	// If Delivered; can't delete
	if (rs[0].ORDERINGSTATUS === "D") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '028')); // Delivered
																		// Purchase
																		// Orders
																		// can
																		// not
																		// be
																		// rejected
		return;
	}

	// If Invoiced; can't delete
	if (rs[0].INVOICINGSTATUS === "D") {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '029')); // Invoiced
																		// Purchase
																		// Orders
																		// can
																		// not
																		// be
																		// rejected
		return;
	}
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
		return;
	}
	try {

		// Update Purchase Order Status in order to delete it
		if (action === "Reject") {
			query = "UPDATE \"SAP_HANA_EPM_NEXT\".\"sap.hana.democontent.epmNext.data::PO.Header\" set APPROVALSTATUS = 'R' where PURCHASEORDERID = ?";			
		}

		if (action === "Accept") {
			query = "UPDATE \"SAP_HANA_EPM_NEXT\".\"sap.hana.democontent.epmNext.data::PO.Header\" set APPROVALSTATUS = 'A' where PURCHASEORDERID = ?";			
		}
		var iRows = conn.executeUpdate(query,purchaseOrderID);
		conn.commit();
		conn.close();
	} catch (error) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(error.message);
		return;
	}

	body = MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
	$.trace.debug(body);
	$.response.contentType = 'application/text';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;

}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "delete":
	deletePO();
	break;
case "approval":
	approvePO();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}