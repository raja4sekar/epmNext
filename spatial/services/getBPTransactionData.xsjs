function getData() {
    // encodeURI to avoid injection attacks
    var bpId = encodeURI($.request.parameters.get('bpId'));
    var output = {};
    var entry;
    var conn = $.hdb.getConnection();
    // get total sales amount
    var query = 
        'select sum(GROSSAMOUNT) as AMOUNT from ' + '"sap.hana.democontent.epmNext.data::SO.Header" ' + 
           'where "PARTNER.PARTNERID" = ?';
    var rs = conn.executeQuery(query,bpId);

    if (rs.length<1) {
        $.response.setBody("Failed to retieve data");
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    } else {
        output.salesTotal = rs[0].AMOUNT;
    }

    // get total sales amount per year
    if (output.salesTotal !== null) {
        query = 
            'select sum(GROSSAMOUNT) as AMOUNT, YEAR("HISTORY.CREATEDAT") as YEAR from ' + '"sap.hana.democontent.epmNext.data::SO.Header" ' + 
               'where "PARTNER.PARTNERID" = ? group by ' + 'YEAR("HISTORY.CREATEDAT") order by YEAR("HISTORY.CREATEDAT")';
        rs = conn.executeQuery(query,bpId);

        if (rs.length<1) {
            $.response.setBody("Failed to retieve data");
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        } else {

            output.salesYoY = [];
            for(var i = 0; i < rs.length; i++){
                entry = {};
                entry.amount = rs[i].AMOUNT;
                entry.year = rs[i].YEAR;
                entry.currency = 'EUR';
                output.salesYoY.push(entry);
            } 
        }
    }

    // total purchase amount
    query = 
        'select sum(GROSSAMOUNT) as AMOUNT from "sap.hana.democontent.epmNext.data::PO.Header" ' + 
           'where "PARTNER.PARTNERID" = ?';
    rs = conn.executeQuery(query,bpId);

    if (rs.length<1) {
        $.response.setBody("Failed to retieve data");
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    } else {
        output.purchaseTotal = rs[0].AMOUNT;
    }

    output.currency = 'EUR';

    // total purchase amount per year
    if (output.purchaseTotal !== null) {
        query = 
            'select sum(GROSSAMOUNT) as AMOUNT, YEAR("HISTORY.CREATEDAT") as YEAR from ' + 
              '"sap.hana.democontent.epmNext.data::PO.Header" ' + 
              'where "PARTNER.PARTNERID" = ? group by YEAR("HISTORY.CREATEDAT") ' + 
              'order by YEAR("HISTORY.CREATEDAT")';
        rs = conn.executeQuery(query,bpId);

        if (rs.length<1) {
            $.response.setBody("Failed to retieve data");
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        } else {

            output.purchaseYoY = [];

            for(var i = 0; i < rs.length; i++){
                entry = {};
                entry.amount = rs[i].AMOUNT;
                entry.year = rs[i].YEAR;
                entry.currency = 'EUR';
                output.purchaseYoY.push(entry);
            } 
        }
    }

    conn.close();

    $.response.setBody(JSON.stringify(output));
    $.response.contentType = "application/json";
    $.response.status = $.net.http.OK;
}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "getData":
        getData();
        break;
    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody('Invalid Command: ');
}