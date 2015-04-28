var body = $.request.body.asString();

var entry = JSON.parse(body);

var responseBody = '';

var conn = $.hdb.getConnection();
var query = 'insert into "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::EPM.MapKeys" values(?,?,?,?,?)';
var rs = conn.executeUpdate(query,"1",entry.APP_ID,entry.APP_CODE,"","");
conn.commit();
conn.close();

$.response.status = $.net.http.CREATED;
$.response.setBody(responseBody);