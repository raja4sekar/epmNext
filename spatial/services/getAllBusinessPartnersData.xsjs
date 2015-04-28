$.response.contentType = "application/json";
var output = {
    entry: []
};

var conn = $.hdb.getConnection();
// get data from BP_ADDRESS_DETAILS
// model location : SHINE/spatial/models
var query = 
    'select PARTNERID,EMAILADDRESS,PHONENUMBER,WEBADDRESS,COMPANYNAME,LEGALFORM,' + 
    'BUILDING,STREET,CITY,POSTALCODE,COUNTRY,REGION,LATITUDE,LONGITUDE FROM ' + 
    '"_SYS_BIC"."sap.hana.democontent.epmNext.spatial.models/BP_ADDRESS_DETAILS"';

var rs = conn.executeQuery(query);

var bpEntry = {};
if (rs.length<1) {
    $.response.setBody("Failed to retieve data");
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} else {
    for(var i = 0; i < rs.length; i++){
        bpEntry = {};
        bpEntry.ID = rs[i].PARTNERID;
        bpEntry.Name = rs[i].COMPANYNAME + ' ' + rs[i].LEGALFORM;
        bpEntry.Street = rs[i].STREET;
        bpEntry.Building = rs[i].BUILDING;
        bpEntry.Zip = rs[i].POSTALCODE;
        bpEntry.City = rs[i].CITY;
        bpEntry.Country = rs[i].COUNTRY;
        bpEntry.Email = rs[i].EMAILADDRESS;
        bpEntry.Phone = rs[i].PHONENUMBER;
        bpEntry.Web = rs[i].WEBADDRESS;
        bpEntry.Region = rs[i].REGION;
        bpEntry.lat = rs[i].LATITUDE;
        bpEntry.long = rs[i].LONGITUDE;


        output.entry.push(bpEntry);
    };

    $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
}
conn.close();