var productId = $.request.parameters.get("ProductId");
	productId = typeof productId !== 'undefined' ? productId : 'HT-1000'
		
var conn = $.hdb.getConnection();

var query = 'SELECT * FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.Item"' +
            ' WHERE "PRODUCT.PRODUCTID" = ?';
var rs = conn.executeQuery(query,productId);

var body = '';

for(var i = 0; i < rs.length; i++){
   if(rs[i]["GROSSAMOUNT"] >= 500){
	body += rs[i]["PURCHASEORDERID"] + "\t" + rs[i]["PURCHASEORDERITEM"] + "\t" + 
			rs[i]["PRODUCT.PRODUCTID"] + "\t" + rs[i]["GROSSAMOUNT"] + "\n";
   }
}


$.response.setBody(body);
$.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
$.response.headers.set('Content-Disposition',
		'attachment; filename=Excel.xls');
$.response.status = $.net.http.OK;