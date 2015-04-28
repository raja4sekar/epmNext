
var productId = $.request.parameters.get("ProductId");
	productId = typeof productId !== 'undefined' ? productId : 'HT-1000'

var conn = $.db.getConnection();

var query = 'SELECT * FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::PO.Item" ' +
            ' WHERE "PRODUCT.PRODUCTID" = ? ';
var pstmt = conn.prepareStatement(query);
    pstmt.setString(1, productId);

var rs = pstmt.executeQuery();

var body = '';
while (rs.next()) {
	var gross = rs.getDecimal(6);
	if(gross >= 500){
		body += rs.getNString(1) + "\t" + rs.getNString(2) + "\t" + 
		        rs.getNString(3) + "\t" + rs.getDecimal(6) + "\n";
	}
}

rs.close();
pstmt.close();

$.response.setBody(body);
$.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
$.response.headers.set('Content-Disposition',
		'attachment; filename=Excel.xls');
$.response.status = $.net.http.OK;