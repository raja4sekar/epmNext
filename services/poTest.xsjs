$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session;

function checkSchema(){
	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var query;
	var count = 0;
	var column = '';
	var schema = $.request.parameters.get("schema");
	
	//check schema existence
	var query = 'SELECT COUNT(*) AS ROWS FROM "SYS"."SCHEMAS"  '+
    '   WHERE "SCHEMA_NAME" = ?';
	rs = conn.executeQuery(query,schema);
	
	for(var i = 0; i < rs.length; i++){
	   count = rs[i].ROWS;}
	if(count<1){
	    $.response.setBody('Schema does not exist');
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    return;
	}
	
	//check header and item table existence
	query = 'SELECT COUNT(*) AS ROWS FROM "SYS"."M_TABLES"  '+
    '   WHERE "SCHEMA_NAME" = ? and TABLE_NAME like ?';
	rs = conn.executeQuery(query,schema,'%PO.Header' );
	for(var i = 0; i < rs.length; i++){
		   count = rs[i].ROWS;}
	if(count<1){
	    $.response.setBody('Purchase Order Header Table Does not exist');
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    return;
	}	

	rs = conn.executeQuery(query,schema,'%PO.Item');
	for(var i = 0; i < rs.length; i++){
		   count = rs[i].ROWS;}
	if(count<1){
	    $.response.setBody('Purchase Order Item Table Does not exist');
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    return;
	}	
	
	//check the number of fields 
	query = 'SELECT count(*) AS ROWS FROM "SYS"."TABLE_COLUMNS"  '+
    '   WHERE "SCHEMA_NAME" = ? and TABLE_NAME like ?';
	rs = conn.executeQuery(query,schema,'%PO.Header');
	for(var i = 0; i < rs.length; i++){
		   count = rs[i].ROWS;}
	if(count<16){
		    $.response.setBody('Not enough fields in the Purchase Order Header');
		    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		    return;
	}	
	if(count>16){
	    $.response.setBody('Too many fields in the Purchase Order Header');
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    return;
	}	
	
	rs = conn.executeQuery(query,schema,'%PO.Item');
	for(var i = 0; i < rs.length; i++){
		   count = rs[i].ROWS;}
	if(count<11){
		    $.response.setBody('Not enough fields in the Purchase Order Item');
		    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		    return;
	}	
	if(count>11){
	    $.response.setBody('Too many fields in the Purchase Order Item');
	    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    return;
	}	
	
	//Check the field names		
	query = 'SELECT COLUMN_NAME FROM "SYS"."TABLE_COLUMNS"  '+
    '   WHERE "SCHEMA_NAME" = ? and TABLE_NAME like ? ORDER BY POSITION';
	rs = conn.executeQuery(query,schema,'%PO.Header');
	
	for(var i = 0; i < rs.length; i++){
	   column = rs[i].COLUMN_NAME;
	   if(["PURCHASEORDERID", "HISTORY.CREATEDBY.EMPLOYEEID",
	                   "HISTORY.CREATEDAT","HISTORY.CHANGEDBY.EMPLOYEEID",
	                   "HISTORY.CHANGEDAT","NOTEID","PARTNER.PARTNERID",
	                   "CURRENCY","GROSSAMOUNT","NETAMOUNT",
	                   "TAXAMOUNT","LIFECYCLESTATUS","APPROVALSTATUS",
	                   "CONFIRMSTATUS","ORDERINGSTATUS","INVOICINGSTATUS"].indexOf(column) === -1){
		    $.response.setBody('Column: '+ column +' in Header table is not valid');
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            return;		   
	   }	   
	}
	
	rs = conn.executeQuery(query,schema,'%PO.Item');
	
	for(var i = 0; i < rs.length; i++){
		   column = rs[i].COLUMN_NAME;
	   if(["PURCHASEORDERID", "PURCHASEORDERITEM", "PRODUCT.PRODUCTID",
	                 "NOTEID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT",
	                 "TAXAMOUNT", "QUANTITY", "QUANTITYUNIT","DELIVERYDATE"].indexOf(column) === -1){
		    $.response.setBody('Column: '+ column +' in Item table is not valid');
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            return;		   
	   }	   
	}

	

    $.response.setBody('All checks passed!');
    $.response.status = $.net.http.OK;
}

function popTables(){
	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var headerName = '';
	var itemName = '';
	var body = '';
	var schema = $.request.parameters.get("schema");
	
	var query = 'SELECT TABLE_NAME FROM "SYS"."M_TABLES"  '+
    '   WHERE "SCHEMA_NAME" = ? AND TABLE_NAME like ?';
	rs = conn.executeQuery(query,schema,'%PO.Header');
	for(var i = 0; i < rs.length; i++){
		headerName = rs[i].TABLE_NAME;
	}
	rs = conn.executeQuery(query,schema,'%PO.Item');
	for(var i = 0; i < rs.length; i++){
		itemName = rs[i].TABLE_NAME;
	}	
	
	query = 'SET SCHEMA "'+ schema + '"';
	conn.executeUpdate(query);
	
	query = 'DELETE FROM "'+ headerName + '"';
	conn.executeUpdate(query);
	
	query = 'DELETE FROM "'+ itemName + '"';
	conn.executeUpdate(query);
	
	query = 'INSERT INTO "'+ headerName + '" VALUES(?,?,now(),?,now(),?,?,?,'+
	        '(SELECT ROUND(TO_DECIMAL(1 + (999999-1)*RAND()),2) FROM DUMMY),'+
	        '(SELECT ROUND(TO_DECIMAL(1 + (999999-1)*RAND()),2) FROM DUMMY),'+
	        '(SELECT ROUND(TO_DECIMAL(1 + (9999-1)*RAND()),2) FROM DUMMY),'+ 
	        '?,?,?,?,?)';
	conn.executeUpdate(query,'0300000001','0000000033','0000000033','','0100000000','EUR','N','I','I','I','I');	
	conn.executeUpdate(query,'0300000002','0000000033','0000000033','','0100000002','EUR','N','I','I','I','I');	
	
	body = body + 'Header table '+ headerName + ' inserted two new records \n';

	query = 'INSERT INTO "'+ itemName + '" VALUES(?,?,?,?,?,'+
    '(SELECT ROUND(TO_DECIMAL(1 + (999999-1)*RAND()),2) FROM DUMMY),'+
    '(SELECT ROUND(TO_DECIMAL(1 + (999999-1)*RAND()),2) FROM DUMMY),'+
    '(SELECT ROUND(TO_DECIMAL(1 + (9999-1)*RAND()),2) FROM DUMMY),'+ 
    '(SELECT ROUND(TO_DECIMAL(1 + (999-1)*RAND()),2) FROM DUMMY),'+    
	'?,add_days(now(),30))';
	conn.executeUpdate(query,'0300000001','0000000010','HT-6100','','EUR','EA');
	conn.executeUpdate(query,'0300000001','0000000020','HT-1103','','EUR','EA');	
	conn.executeUpdate(query,'0300000001','0000000030','HT-1101','','EUR','EA');
	conn.executeUpdate(query,'0300000002','0000000010','HT-6100','','EUR','EA');	
	conn.executeUpdate(query,'0300000002','0000000020','HT-1103','','EUR','EA');	
	conn.executeUpdate(query,'0300000002','0000000030','HT-1101','','EUR','EA');	
	
	body = body + 'Item table '+ itemName + ' inserted six new records \n';
	
	conn.commit();
	conn.close();
	
    $.response.setBody(body);
    $.response.status = $.net.http.OK;	
}

function getData(){
	var conn = $.hdb.getConnection();
	var pstmt;
	var rs;
	var headerName = '';
	var itemName = '';
	var body = '';
	var schema = $.request.parameters.get("schema");
	
	var query = 'SELECT TABLE_NAME FROM "SYS"."M_TABLES"  '+
    '   WHERE "SCHEMA_NAME" = ? AND TABLE_NAME like ?';
	rs = conn.executeQuery(query, schema, '%PO.Header');
	for(var i = 0; i < rs.length; i++){
		headerName = rs[i].TABLE_NAME;
	}
	
	rs = conn.executeQuery(query, schema, '%PO.Item');
	for(var i = 0; i < rs.length; i++){
		itemName = rs[i].TABLE_NAME;
	}
	
	query = 'SET SCHEMA "'+ schema + '"';
	conn.executeUpdate(query);
	
	
	query = 'SELECT * FROM "'+ headerName + '" ';
	rs = conn.executeQuery(query);
	var jHeader = [];
	for(var i = 0; i < rs.length; i++){
		jHeader.push(rs[i]);
	}
	
	query = 'SELECT * FROM "'+itemName + '" ';
	rs = conn.executeQuery(query);
	var jItem = [];
	for(var i = 0; i < rs.length; i++){
		jItem.push(rs[i]);
	}
	
	var jsonOut = [];
	jsonOut.push(jHeader); jsonOut.push(jItem);
	conn.close();

	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(jsonOut));
	
	
}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getSessionInfo":
	SESSIONINFO.fillSessionInfo();
	break; 
case "checkSchema":
	checkSchema();
	break;
case "popTables":
	popTables();
	break;
case "getData":
	getData();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('Invalid Request Method');
}