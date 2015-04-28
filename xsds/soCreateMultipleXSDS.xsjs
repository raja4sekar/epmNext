$.import("sap.hana.xs.libs.dbutils", "xsds");
var XSDS = $.sap.hana.xs.libs.dbutils.xsds;

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
var lv_item_id;
var result;
var query;
var rs, pstmt, pc;

responseBody += 'BP_ID:' + encodeURI(overallsoData.PARTNERID) + "\n";

var conn = $.hdb.getConnection();
conn.executeUpdate('SET SCHEMA "SAP_HANA_EPM_NEXT"');

query = 'SELECT "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::salesOrderId".NEXTVAL as NEWID from Dummy';
rs = conn.executeQuery(query);
var overAllId = '';

for(var i = 0; i < rs.length; i++){
    overAllId = rs[i].NEWID;
    responseBody += 'so id ' + overAllId + '\n';
}

lv_bp_id = encodeURI(overallsoData.PARTNERID);

var bp = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.BusinessPartner", {}, { $schemaName: "SAP_HANA_EPM_NEXT" });
var prod = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.Products" ); //, {} , { $schemaName: "SAP_HANA_EPM_NEXT" });
var soHeader = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "SO.Header", {}, { $schemaName: "SAP_HANA_EPM_NEXT" });
var soItem = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "SO.Item", {}, { $schemaName: "SAP_HANA_EPM_NEXT" });
var emp = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.Employees", {}, { $schemaName: "SAP_HANA_EPM_NEXT" });
var empdetails = emp.$get({ EMPLOYEEID: '0000000033' });

var bpdetails = bp.$get({ PARTNERID: lv_bp_id });
var lv_company = bpdetails.COMPANYNAME;
responseBody += 'lv_company ' + lv_company + '\n';

var newSO = new soHeader(
{   SALESORDERID:'0'+ overAllId,
    HISTORY:{CREATEDBY:empdetails, CREATEDAT: new Date(), CHANGEDBY: empdetails, CHANGEDAT: new Date()},
    NOTEID:'NOTE1234',
    PARTNER:bpdetails,
	CURRENCY:'EUR',
	LIFECYCLESTATUS:'N',
	BILLINGSTATUS:'I',
	DELIVERYSTATUS:'I' }
);
newSO.$save();

var proddetails;
var lv_price;
var newItem;
//Insert all Sales Order Items
    so_items = overallsoData.SalesOrderItems;
    for (var i = 0; i < so_items.length; i++) {

        responseBody += 'item' + i + ' ' + 'Product_Id:' + so_items[i].Product_Id;
        responseBody += 'item' + i + ' ' + 'Quantity:' + so_items[i].Quantity;
        lv_productid = encodeURI(so_items[i].Product_Id);
        lv_quantity = encodeURI(so_items[i].Quantity);
        // Get price of the product from Product table
        proddetails = prod.$get({ PRODUCTID: lv_productid });
        lv_price = proddetails.PRICE;
        responseBody += 'lv_price ' + lv_price + '\n';
        
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
        
         if (item_id >= 100) {
            lv_item_id ='0000000' + item_id;
        } else {
            lv_item_id ='00000000' + item_id;
        }
        newItem = new soItem(
		
		{   SALESORDERID: newSO.SALESORDERID,
			SALESORDERITEM:lv_item_id,
			PRODUCT:proddetails,
			CURRENCY:"EUR",
			GROSSAMOUNT:lv_grossamount,
            NETAMOUNT:lv_netamount,
            TAXAMOUNT:lv_taxamount,
            ITEMATPSTATUS:"I",
		    QUANTITY:lv_quantity,
		    QUANTITYUNIT:"EA"});
 
        newItem.$save();
        item_id = item_id + 10;

        //Calculate the total of net amount, gross amount and tax amount for all line items
        lv_so_netamount = lv_so_netamount + lv_netamount;
        lv_so_grossamount = lv_so_grossamount + lv_grossamount;
        lv_so_taxamount = lv_so_taxamount + lv_taxamount;


    }

newSO.GROSSAMOUNT = lv_so_grossamount;
newSO.NETAMOUNT = lv_so_netamount;
newSO.TAXAMOUNT= lv_so_taxamount;
newSO.$save();

$.response.status = $.net.http.CREATED;
$.response.setBody(responseBody);