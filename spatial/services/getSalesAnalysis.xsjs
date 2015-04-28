try {

    var requestBody = $.request.body.asString();

    var polygon = JSON.parse(requestBody);
    var i = 0;
    // create polygon search string
    var polygonString = 'NEW ST_Point(LATITUDE, LONGITUDE).ST_Within( NEW ST_Polygon(\'Polygon((';
    for (i; i < polygon.points.length; i++) {
        polygonString += polygon.points[i].lat + ' ' + polygon.points[i].long;
        if (i !== polygon.points.length - 1) {
            polygonString += ',';
        }
    }
    polygonString += "))')) AS POINT";

    var conn = $.hdb.getConnection();
    var query;
    var rs;
    var cond;
    var entry;
    var body = {};

    // get the total sales amount for the region
    // make sure the polygon is complete i.e. first and last point are same
    query = 'select SUM(GROSSAMOUNT),' + polygonString + ' from "_SYS_BIC"."sap.hana.democontent.epmNext.spatial.models/REGION_SALES_BP" group by ' + polygonString;
    rs = conn.executeQuery(query);

    var totalSalesAmount = '';

    for(var i = 0; i < rs.length; i++){
        cond = parseInt(rs[i].POINT, 10);
        if (cond === 1) {
            body.totalSales = rs[i].GROSSAMOUNT;
        }
    }

    body.topBuyers = [];

    // get the top 5 buyers 
    // make sure the polygon is complete i.e. first and last point are same
    query = 'select PARTNERID,COMPANYNAME,LEGALFORM,LATITUDE,LONGITUDE,SUM(GROSSAMOUNT) as TOTAL,' + polygonString + 
            ' from "_SYS_BIC"."sap.hana.democontent.epmNext.spatial.models/REGION_SALES_BP" group by PARTNERID,COMPANYNAME,LEGALFORM,LATITUDE,LONGITUDE,' + polygonString + 
            ' order by SUM(GROSSAMOUNT) desc';
    rs = conn.executeQuery(query);

    var count = 0;
    for(var i = 0; i < rs.length; i++){
        cond = parseInt(rs[i].POINT, 10);
        if (cond === 1) {
            count++;
            entry = {};
            entry.partnerID = rs[i].PARTNERID;
            entry.companyName = rs[i].COMPANYNAME;
            entry.legalForm = rs[i].LEGALFORM;
            entry.totalSales = rs[i].TOTAL;
            entry.lat = rs[i].LATITUDE;
            entry.long = rs[i].LONGITUDE;
            body.topBuyers.push(entry);
        }
        if (count >= 5) {
            break;
        }
    }

    // get the sales amount year over year
    // make sure the polygon is complete i.e. first and last point are same
    query = 'select YEAR_OF_SALE,SUM(GROSSAMOUNT) as TOTAL,' + polygonString + 
            'from "_SYS_BIC"."sap.hana.democontent.epmNext.spatial.models/REGION_SALES_BP" group by YEAR_OF_SALE,' + polygonString + 
            ' order by YEAR_OF_SALE';
    rs = pstmt.executeQuery();

    body.salesYoY = [];

    for(var i = 0; i < rs.length; i++){
        cond = parseInt(rs[i].POINT, 10);
        if (cond === 1) {
            entry = {};
            entry.year = rs[i].YEAR_OF_SALE;
            entry.salesAmount = rs[i].TOTAL;
            body.salesYoY.push(entry);
        }
    }

    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify(body));
    $.response.status = $.net.http.OK;

    conn.close();

} catch (e) {
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    $.response.setBody(e.message);
}