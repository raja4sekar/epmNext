/* Create Sales Order with multiple line items*/
var body = $.request.body.asString();

var overallsoData = JSON.parse(body);

var responseBody = '';
var so_items;
var gross_amt = 0;
var prod_price = 0;
var lv_productid;
var lv_price;
var lv_quantity;
var lv_netamount;
var lv_taxamount;
var lv_grossamount;
var item_id = 10;
var lv_so_netamount = 0;
var lv_so_grossamount = 0;
var lv_so_taxamount = 0;
//var i = 0;
var lv_bp_id;
var lv_company;
var lv_table;
var lv_tax = 0;

responseBody += 'BP_ID:' + encodeURI(overallsoData.PARTNERID) + "\n";

var conn = $.hdb.getConnection(); 
conn.executeUpdate("SET SCHEMA \"SAP_HANA_EPM_NEXT\"");  

var query = 'SELECT \"SAP_HANA_EPM_NEXT\".\"sap.hana.democontent.epmNext.data::salesOrderId\".NEXTVAL as NEWID from Dummy';
var rs = conn.executeQuery(query);  
var overAllId = '';

for(var i = 0; i < rs.length; i++){
    overAllId = rs[i].NEWID;
    responseBody += 'so id ' + overAllId + '\n';
}

//Get the company name for the BP id and store it in a local variable
lv_bp_id = encodeURI(overallsoData.PARTNERID);
//use prepared statement to avoid sql injection attacks
var query = 'SELECT COMPANYNAME from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.BusinessPartner" where PARTNERID = ?';
var rs = conn.executeQuery(query, lv_bp_id);  
for(var i = 0; i < rs.length; i++){
	lv_company = rs[i].COMPANYNAME;  
	responseBody += 'lv_company ' + lv_company + '\n';
}

so_items = overallsoData.SalesOrderItems;

//Insert all Sales Order Items
if (so_items) {

    for (var i = 0; i < so_items.length; i++) {
        responseBody += 'item' + i + ' ' + 'Product_Id:' + so_items[i].Product_Id;  
        responseBody += 'item' + i + ' ' + 'Quantity:' + so_items[i].Quantity;

		lv_productid = encodeURI(so_items[i].Product_Id);
		lv_quantity = encodeURI(so_items[i].Quantity);
		// Get price of the product from Product table
		var query = 'SELECT PRICE from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" where PRODUCTID = ?';
		var rs = conn.executeQuery(query, lv_productid);  

		for(var i = 0; i < rs.length; i++){
			lv_price = rs[i].PRICE;  
			responseBody += 'lv_price ' + lv_price + '\n';
		}
		
		
		 var DT_TAX_CALCULATION = conn.loadProcedure("_SYS_BIC", 
	    	"sap.hana.democontent.epmNext.models/DT_TAX_CALCULATION");

	        var taxIn = [{PARTNERID: lv_bp_id, COMPANYNAME: lv_company, PRODUCTID: lv_productid }];
	        rs = DT_TAX_CALCULATION(taxIn);        
	        
	        for(var i = 0; i < rs.returned_tt.length; i++){
	            lv_tax = rs.returned_tt[i].TAX;
	            responseBody += 'lv_tax ' + lv_tax + '\n';            
	    }

		lv_netamount = lv_price * lv_quantity;
		//Get the tax amount based on the tax code
		lv_taxamount = lv_netamount * lv_tax;
		lv_grossamount = lv_netamount + lv_taxamount;
		//Insert Item into table
		var query = 'insert into "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::SO.Item"'
		         + " values(?,?,?,'','EUR',?,?,?,'I','',?,'EA','')";
		rs = conn.executeUpdate(query,'0' + overAllId,'00000000' + item_id,lv_productid,lv_grossamount,lv_netamount,lv_taxamount,lv_quantity);
		
		item_id = item_id + 10;
		
		//Calculate the total of net amount, gross amount and tax amount for all line items
		lv_so_netamount = lv_so_netamount + lv_netamount;
		lv_so_grossamount = lv_so_grossamount + lv_grossamount;
		lv_so_taxamount = lv_so_taxamount + lv_taxamount;

    }

}

//Insert Sales Order Header
var query = 'insert into \"SAP_HANA_EPM_NEXT\".\"sap.hana.democontent.epmNext.data::SO.Header\"'
      + " values(?,'0000000033',CURRENT_DATE,'0000000033',CURRENT_DATE,''," 
      + "?,'EUR',?,?,?,'N','I','I')";
rs = conn.executeUpdate(query, '0' + overAllId,overallsoData.PARTNERID,lv_so_grossamount,lv_so_netamount,lv_so_taxamount);  
conn.commit();
conn.close();

$.response.status = $.net.http.CREATED;
$.response.setBody(responseBody);


