//Get all the Business Partners into an array
function getBuinessPartners() {
    var bpDict = [];

    var conn = $.hdb.getConnection();
    var query = "SELECT \"PARTNERID\" FROM \"sap.hana.democontent.epmNext.data::MD.BusinessPartner\"";
    var rsBP = conn.executeQuery(query);
    for(var i = 0; i < rsBP.length; i++){
        bpDict.push(rsBP[i].PARTNERID);
    }
    conn.close();

    return bpDict;
}
//Get all Products into an array
function getProducts() {
    var prodDict = [];

    var conn = $.hdb.getConnection();

    // Select ProductId and the corresponding Price
    var query = "SELECT \"PRODUCTID\", \"PRICE\" FROM \"sap.hana.democontent.epmNext.data::MD.Products\"";
    var rs = conn.executeQuery(query);
    for(var i = 0; i < rs.length; i++){
        prodDict.push({
            prod: rs[i].PRODUCTID,
            price: rs[i].PRICE
        });
    }
    conn.close();
    return prodDict;
}

//Reset the sequence of the specified table
function resetTableSequence(object) {
    var selectQuery = '';
    var altQuery = '';
    var pstmt;
    var rs;
    var maxId = -1;
    switch (object) {
        case "addressSeqId":
            selectQuery = 'SELECT to_int(MAX("ADDRESSID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::MD.Addresses"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::addressSeqId" RESTART WITH ';
            break;
        case "employeeSeqId":
            selectQuery = 'SELECT to_int(MAX("EMPLOYEEID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::MD.Employees"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::employeeSeqId" RESTART WITH ';
            break;
        case "partnerSeqId":
            selectQuery = 'SELECT to_int(MAX("PARTNERID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::MD.BusinessPartner"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::partnerSeqId" RESTART WITH ';
            break;
        case "purchaseOrderSeqId":
            selectQuery = 'SELECT to_int(MAX("PURCHASEORDERID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::PO.Header"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::purchaseOrderSeqId" RESTART WITH ';
            break;
        case "salesOrderId":
            selectQuery = 'SELECT to_int(MAX("SALESORDERID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::SO.Header"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::salesOrderId" RESTART WITH ';
            break;
        case "textSeqId":
            selectQuery = 'SELECT to_int(MAX("TEXTID") + 1) AS MAXID FROM "sap.hana.democontent.epmNext.data::Util.Texts"';
            altQuery = 'ALTER SEQUENCE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::textSeqId" RESTART WITH ';
            break;
        default:
            return maxId;
    }
    var conn = $.hdb.getConnection();
    rs = conn.executeQuery(selectQuery);
    for(var i = 0; i < rs.length; i++){
      maxId = rs[0].MAXID;
    }
    

    if (maxId !== null && maxId !== -1) {
        conn.executeUpdate(altQuery + maxId);
    }
    //	End of code based on new logic
    conn.commit();
    conn.close();

    return maxId;

}