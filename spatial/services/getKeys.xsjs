$.response.contentType = "application/json";
var output = {
    entry: {}
};

var conn = $.hdb.getConnection();
// get keys from MapKeys table
var query = 'select TOP 1 "KEYID","APP_ID","APP_CODE",' + '"EXT1","EXT2" from "sap.hana.democontent.epmNext.data::EPM.MapKeys"';
var rs = conn.executeQuery(query);

if (rs.length<1) {
    $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
} else {
    for(var i = 0; i < rs.length; i++){
        // add the keys retrieved from database to response
        output.entry.APP_ID = rs[i].APP_ID;
        output.entry.APP_CODE = rs[i].APP_CODE;
    } ;

    $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
}
conn.close();