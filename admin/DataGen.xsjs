$.import("sap.hana.democontent.epmNext.services", "messages");
$.import("sap.hana.democontent.epmNext.admin", "dghelper");

var MESSAGES = $.sap.hana.democontent.epmNext.services.messages;
var dg = $.sap.hana.democontent.epmNext.admin.dghelper;
var bpDict = dg.getBuinessPartners();
var prodDict = dg.getProducts();

var aStartDate = $.request.parameters.get('startdate');
var aEndDate = $.request.parameters.get('enddate');
//encodeURI() used to avoid SQL injection
var aNoRec = encodeURI($.request.parameters.get('noRec'));
var aCmd = encodeURI($.request.parameters.get('cmd'));

/**  
@function Outputs the Session user and Language as JSON in the Response body
*/
function fillSessionInfo(){
	var body = '';
	body = JSON.stringify({
		"session" : [{"UserName": $.session.getUsername(), "Language": $.session.language}] 
	});
	$.response.contentType = 'application/json'; 
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}

function reloadSeed() {
    try {
        var object = encodeURI($.request.parameters.get('object'));
        var body = '';
        var tblNames;
        var conn;
        var query;
        var pstmt;
        var i;

        switch (object) {
            case "master":
                tblNames = ['MD.Addresses', 'MD.BusinessPartner', 'MD.Employees', 'MD.Products',
                    'Util.Constants', 'Util.Texts', 'Util.Notes', 'Util.Attachments'
                ];
                break;
            case "transactional":
                tblNames = ['SO.Header', 'SO.Item', 'PO.Header', 'PO.Item'];
                break;
            default:
                $.response.status = $.net.http.BAD_REQUEST;
                $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '003'));
                return;
        }

        conn = $.hdb.getConnection();

        for (i = 0; i < tblNames.length; i++) {
            // Truncate the existing table
            query = 'TRUNCATE TABLE "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::' + tblNames[i] + '"';
            conn.executeUpdate(query);
            conn.commit();
            body = body + 'Truncated: sap.hana.democontent.epmNext.data::' + tblNames[i] + ' \n';
        }

        for (i = 0; i < tblNames.length; i++) {
            body = body + 'Reseeded: sap.hana.democontent.epmNext.data.loads::' + tblNames[i] + '\n';
        }
        $.response.status = $.net.http.OK;
        $.response.setBody(body);

    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}
//Reset sequence after generating data.
function resetSequence() {
    try {

        var object = encodeURI($.request.parameters.get('object'));
        var body = '';
        var maxId = dg.resetTableSequence(object);
        body = body + 'Sequence reset: sap.hana.democontent.epmNext.data::' + object + ' to ' + maxId + ' \n';
        if (maxId === -1) {
            $.response.status = $.net.http.BAD_REQUEST;
            $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '004'));
        } else {
            $.response.status = $.net.http.OK;
            $.response.setBody(body);
        }

    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}

//Generate Purchase Orders by replicating from table 
function replicatePurchaseOrders() {
    var body = '';
    var maxPoId = '';
    try {
        var conn = $.hdb.getConnection();
        var query = 'SELECT MAX("PURCHASEORDERID") AS MAXID FROM "sap.hana.democontent.epmNext.data::PO.Header"';
        var rs = conn.executeQuery(query);
        for(var i = 0; i < rs.length; i++){
            maxPoId = rs[i].MAXID;
        }
        maxPoId = parseInt(maxPoId, 10) + 1;

        query = 'INSERT INTO "sap.hana.democontent.epmNext.data::PO.Header" ' + '("PURCHASEORDERID", "HISTORY.CREATEDBY.EMPLOYEEID", "HISTORY.CREATEDAT", "HISTORY.CHANGEDBY.EMPLOYEEID", "HISTORY.CHANGEDAT", "NOTEID", ' + ' "PARTNER.PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "LIFECYCLESTATUS", "APPROVALSTATUS", "CONFIRMSTATUS", "ORDERINGSTATUS", "INVOICINGSTATUS" ) ' + 'select \'0\' || to_int("PURCHASEORDERID" + ' + maxPoId + ' - 300000000 ), "HISTORY.CREATEDBY.EMPLOYEEID", "HISTORY.CREATEDAT", "HISTORY.CHANGEDBY.EMPLOYEEID", "HISTORY.CHANGEDAT", "NOTEID", ' + ' "PARTNER.PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "LIFECYCLESTATUS", "APPROVALSTATUS", "CONFIRMSTATUS", "ORDERINGSTATUS", "INVOICINGSTATUS" ' + '  from "sap.hana.democontent.epmNext.data::PO.Header" WHERE "PURCHASEORDERID" <= ' + "  '0300000999' ";
        var iNumPo = conn.executeUpdate(query);
        body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', iNumPo,
            'PO.Header') + "\n";

        query = 'INSERT INTO "sap.hana.democontent.epmNext.data::PO.Item" ' + '("PURCHASEORDERID", "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE") ' + 'select \'0\' || to_int("PURCHASEORDERID" + ' + maxPoId + ' - 300000000 ), "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE" ' + '  from "sap.hana.democontent.epmNext.data::PO.Item" WHERE "PURCHASEORDERID" <= ' + " '0300000999' ";
        var iNumItem = conn.executeUpdate(query);
        body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', iNumItem, 'PO.Item') + "\n";
        conn.commit();
        conn.close();
        dg.resetTableSequence('purchaseOrderSeqId');
        $.response.status = $.net.http.OK;
        $.response.setBody(body);
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}

//Helper method to created time based purchase order when batch size is 1
function createTimeBasedPOBSOne(StartDateStr) {
    var maxPoId = '';
    try {
        var conn = $.hdb.getConnection();

        //Randomly extract the product and the corresponding price of the selected product
        var randProductIndex = Math.floor(Math.random() * 105);
        var randProduct = prodDict[randProductIndex].prod;
        var randPrice = prodDict[randProductIndex].price;

        //Extract the max PO Id
        var query = "SELECT MAX(\"PURCHASEORDERID\") AS MAXID FROM \"sap.hana.democontent.epmNext.data::PO.Header\"";
        var rsMax = conn.executeQuery(query);
        for(var i = 0; i < rsMax.length; i++){
            maxPoId = rsMax[i].MAXID;
        }
        maxPoId = parseInt(maxPoId, 10) + 1;
        maxPoId = maxPoId.toString();
        var randQuantity = Math.floor((Math.random() * 9) + 1);
        var randNetAmount = parseInt((randQuantity * randPrice).toFixed(2), 10);
        var randTaxAmount = parseInt((randNetAmount * 0.19).toFixed(2), 10); // Taking 19% Tax	
        var randGrossAmount = randNetAmount + randTaxAmount;

        //Insert the items for purchaseOrderItem table
        query = "INSERT INTO \"sap.hana.democontent.epmNext.data::PO.Item\" " + "(\"PURCHASEORDERID\", \"PURCHASEORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " + "VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        conn.executeUpdate(query,"0" + maxPoId,"0000000010",randProduct,"NoteId","EUR",randGrossAmount,randNetAmount,randTaxAmount,randQuantity,"EA",StartDateStr);

        //Randomly extract the business partner from businessPartnerArray
        var randBPIndex = Math.floor(Math.random() * 44); // since BP is 45
        var randBP = bpDict[randBPIndex];

        //Insert the items for purchaseOrderHeader table
        query = "INSERT INTO \"sap.hana.democontent.epmNext.data::PO.Header\"" + "(\"PURCHASEORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"APPROVALSTATUS\", \"CONFIRMSTATUS\", \"ORDERINGSTATUS\", \"INVOICINGSTATUS\" )" + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        conn.executeUpdate(query,"0" + maxPoId,"0000000033",StartDateStr,"0000000033",StartDateStr,"NoteId",randBP,"EUR",randGrossAmount,randNetAmount,"N","I","I","I","I");
        conn.commit();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}

//Helper method to create time based purchase orders when the batch size is more than 1
function createTimeBasedPO(StartDateStr, BATCHSIZE) {
    var maxPoId = '';
    var randProductIndex, randProduct, randPrice, randQuantity, randNetAmount, randTaxAmount, randGrossAmount, randBPIndex, randBP;
    try {
        var conn = $.hdb.getConnection();
        var i;

        //Insert statement for purchaseOrderItem table
        var query = "INSERT INTO \"sap.hana.democontent.epmNext.data::PO.Item\" " + "(\"PURCHASEORDERID\", \"PURCHASEORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " + "VALUES (?,?,?,?,?,?,?,?,?,?,?)";

        //Insert statement for purchaseOrderHeader table
        var queryPO = "INSERT INTO \"sap.hana.democontent.epmNext.data::PO.Header\"" + "(\"PURCHASEORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"APPROVALSTATUS\", \"CONFIRMSTATUS\", \"ORDERINGSTATUS\", \"INVOICINGSTATUS\" )" + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        //Extract the max PO Id
        var queryMaxPO = "SELECT MAX(\"PURCHASEORDERID\") AS MAXID FROM \"sap.hana.democontent.epmNext.data::PO.Header\"";
        var rsMax = conn.executeQuery(queryMaxPO);
        for(var i = 0; i < rsMax.length; i++){
            maxPoId = rsMax[i].MAXID;
        }

        //batch inserts
        var itemArray = [];
        var headArray = [];
        
        for (i = 0; i < BATCHSIZE; i++) {

            //Randomly extract the product and the corresponding price of the selected product
            randProductIndex = Math.floor(Math.random() * 105);
            randProduct = prodDict[randProductIndex].prod;
            randPrice = prodDict[randProductIndex].price;

            //Creating values to be inserted purchaseOrderItem table			
            maxPoId = parseInt(maxPoId, 10) + 1;
            maxPoId = maxPoId.toString();
            randQuantity = Math.floor((Math.random() * 9) + 1);
            randNetAmount = parseInt((randQuantity * randPrice).toFixed(2), 10);
            randTaxAmount = parseInt((randNetAmount * 0.19).toFixed(2), 10); // Taking 19% Tax
            randGrossAmount = randNetAmount + randTaxAmount;
            
            itemArray.push(["0" + maxPoId,"0000000010",randProduct,"NoteId","EUR",randGrossAmount,randNetAmount,randTaxAmount,randQuantity,"EA",StartDateStr])

            //Randomly extract the business partner from businessPartnerArray
            randBPIndex = Math.floor(Math.random() * 44); // since BP is 45
            randBP = bpDict[randBPIndex];

            //Creating values to be inserted for the purchaseOrderHeader table
            headArray.push(["0" + maxPoId,"0000000033",StartDateStr,"0000000033",StartDateStr,"NoteId",randBP,"EUR",randGrossAmount,randNetAmount,randTaxAmount,"N","I","I","I","I"]);
        }      
        
        conn.executeUpdate(query, itemArray);
        conn.executeUpdate(queryPO, headArray);
        conn.commit();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}

//Create Purchase Orders distributed randomly across a time period
function replicateTimeBasedPurchaseOrders(aStartDate, aEndDate, aNoRec) {

    var body = '';
    var alpha = 0;
    var thetaArray = [];
    var i = 0;
    var randNo = 0;
    var j;
    var noRecords = aNoRec;
    var calc;
    var tempthetaArray, startDay, startMonth, startYear, StartDateStr, BATCHSIZE;

    //Calculate the number of days
    var StartDate = new Date(aStartDate);
    var endDate = new Date(aEndDate);
    var timeDiff = Math.abs(endDate.getTime() - StartDate.getTime());
    var diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))) + 1;

    if (aNoRec === 0) {
        return;
    }

    //Get the random number of purchase orders to be generated for each day finally stored in thetaArray[]
    randNo = Math.random();
    alpha = Math.round(aNoRec / diffDays);
    thetaArray[0] = Math.round(alpha * randNo);
    aNoRec = +(aNoRec - thetaArray[i]) || 0;

    for (i = 1; i < diffDays - 1; i++) {
        //Generate a random number
        randNo = Math.random();
        alpha = Math.round(aNoRec / (diffDays - i));
        calc = Math.round(alpha * randNo) * Math.round(6 * randNo);
        thetaArray[i] = (calc <= aNoRec) ? calc : 0;
        aNoRec = +(aNoRec - thetaArray[i]) || 0;
    }

    thetaArray[diffDays - 1] = +aNoRec || 0;
    //Loop to distribute the random purchase orders to be generated across each day(date) and also calculate the BATCHSIZE
    for (j = 0; j < diffDays; j++) {
        tempthetaArray = thetaArray[j];
        startDay = StartDate.getDate();
        startMonth = StartDate.getMonth() + 1; // Jan is 0
        startYear = StartDate.getFullYear();
        if (thetaArray[j] === 0) {
            continue;
        }
        if (startDay < 10) {
            startDay = '0' + startDay;
        }
        if (startMonth < 10) {
            startMonth = '0' + startMonth;
        }
        StartDateStr = startYear.toString() + startMonth.toString() + startDay;
        if (tempthetaArray !== 0) {
            BATCHSIZE = thetaArray[j];
            if (BATCHSIZE === 1) {
                createTimeBasedPOBSOne(StartDateStr);
            } else {
                createTimeBasedPO(StartDateStr, BATCHSIZE);
            }
        }
        // Increment Date
        StartDate.setDate(StartDate.getDate() + 1);
    }
    //Update sequence
    dg.resetTableSequence('purchaseOrderSeqId');
    body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', noRecords,
        'Purchase.Header') + "\n";

    $.response.status = $.net.http.OK;
    $.response.setBody(body);

}

//Generate Sales Orders by replicating from table
function replicateSalesOrders() {
    var body = '';
    var maxSoId = '';

    try {
        var conn = $.hdb.getConnection();
        var query = 'SELECT MAX("SALESORDERID") AS MAXID FROM "sap.hana.democontent.epmNext.data::SO.Header"';
        var rs = conn.executeQuery(query);
        for(var i = 0; i < rs.length; i++){
            maxSoId = rs[i].MAXID;
        }
        maxSoId = parseInt(maxSoId, 10) + 1;

        query = 'INSERT INTO "sap.hana.democontent.epmNext.data::SO.Header" ' + '("SALESORDERID", "HISTORY.CREATEDBY.EMPLOYEEID", "HISTORY.CREATEDAT", "HISTORY.CHANGEDBY.EMPLOYEEID", "HISTORY.CHANGEDAT", "NOTEID", ' + ' "PARTNER.PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "LIFECYCLESTATUS", "BILLINGSTATUS", "DELIVERYSTATUS" ) ' + 'select \'0\' || to_int("SALESORDERID" + ' + maxSoId + ' - 500000000 ), "HISTORY.CREATEDBY.EMPLOYEEID", ' + ' add_days(now(), ROUND(TO_DECIMAL(-365 + (0+365)*RAND()),0)), ' + ' "HISTORY.CHANGEDBY.EMPLOYEEID", "HISTORY.CHANGEDAT", "NOTEID", ' + ' "PARTNER.PARTNERID", "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", ' + ' "LIFECYCLESTATUS", "BILLINGSTATUS", "DELIVERYSTATUS" ' + '  from "sap.hana.democontent.epmNext.data::SO.Header" WHERE "SALESORDERID" <= ' + " '0500000999' ";
        var iNumSo = conn.executeUpdate(query);
        body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', iNumSo, 'SO.Header') + "\n";

        query = 'INSERT INTO "sap.hana.democontent.epmNext.data::SO.Item" ' + '("SALESORDERID", "SALESORDERITEM", "PRODUCT.PRODUCTID", "NOTEID", "CURRENCY", ' + ' "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE") ' + 'select \'0\' || to_int("SALESORDERID" + ' + maxSoId + ' - 500000000 ), "SALESORDERITEM", ' + '"PRODUCT.PRODUCTID"' + ', "NOTEID", "CURRENCY", ' + ' "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT", "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT", "DELIVERYDATE" ' + '  from "sap.hana.democontent.epmNext.data::SO.Item" WHERE "SALESORDERID" <= ' + " '0500000999' ";
        var iNumItem = conn.executeUpdate(query);
        conn.commit();
        conn.close();
        dg.resetTableSequence('salesOrderId');
        body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', iNumItem,
            'SO.Item') + "\n";


        $.response.status = $.net.http.OK;
        $.response.setBody(body);
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}

//Helper method to created time based sales order when batch size is 1
function createTimeBasedSOBSOne(StartDateStr) {
    var maxSoId = '';
    try {
        var conn = $.hdb.getConnection();

        //Randomly extract the product and the corresponding price of the selected product
        var randProductIndex = Math.floor(Math.random() * 105);
        var randProduct = prodDict[randProductIndex].prod;
        var randPrice = prodDict[randProductIndex].price;

        //Extract the max SO Id
        var query = "SELECT MAX(\"SALESORDERID\") AS MAXID FROM \"sap.hana.democontent.epmNext.data::SO.Header\"";
        var rsMax = conn.executeQuery(query);
        for(var i = 0; i < rsMax.length; i++){
            maxSoId = rsMax[i].MAXID;
        }

        maxSoId = parseInt(maxSoId, 10) + 1;
        maxSoId = maxSoId.toString();
        var randQuantity = Math.floor((Math.random() * 9) + 1);
        var randNetAmount = parseInt((randQuantity * randPrice).toFixed(2), 10);
        var randTaxAmount = parseInt((randNetAmount * 0.19).toFixed(2), 10); // Taking 19% Tax	
        var randGrossAmount = randNetAmount + randTaxAmount;
        query = "INSERT INTO \"sap.hana.democontent.epmNext.data::SO.Item\" " + "(\"SALESORDERID\", \"SALESORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"ITEMATPSTATUS\",\"OPITEMPOS\",\"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        conn.executeUpdate(query, "0" + maxSoId,"0000000010",randProduct,"NoteId","EUR",randGrossAmount,randNetAmount,randTaxAmount,"I","?",randQuantity,"EA",StartDateStr);

        //Randomly extract the business partner from businessPartnerArray
        var randBPIndex = Math.floor(Math.random() * 44); // since BP is 45
        var randBP = bpDict[randBPIndex];

        //Insert the items for salesOrderHeader table
        query = "INSERT INTO \"sap.hana.democontent.epmNext.data::SO.Header\"" + "(\"SALESORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\",\"BILLINGSTATUS\", \"DELIVERYSTATUS\")" + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        conn.executeUpdate(query,"0" + maxSoId,"0000000033",StartDateStr,"0000000033",StartDateStr,"NoteId",randBP,"EUR",randGrossAmount,randNetAmount,randTaxAmount,"N","I","I");
        conn.commit();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}
//Helper method to create time based sales orders when the batch size is more than 1
function createTimeBasedSO(StartDateStr, BATCHSIZE) {
    var maxSoId = '';
    var randProductIndex, randProduct, randPrice, randQuantity, randNetAmount, randTaxAmount, randGrossAmount, randBPIndex, randBusinessPartner;
    try {
        var conn = $.hdb.getConnection();
        var i;

        //Insert statement for purchaseOrderItem table
        var query = "INSERT INTO \"sap.hana.democontent.epmNext.data::SO.Item\" " + "(\"SALESORDERID\", \"SALESORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\",\"ITEMATPSTATUS\",\"OPITEMPOS\",\"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

        //Insert statement for purchaseOrderHeader table
        var querySO = "INSERT INTO \"sap.hana.democontent.epmNext.data::SO.Header\"" + "(\"SALESORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"BILLINGSTATUS\", \"DELIVERYSTATUS\")" + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        //Extract the max PO Id
        var queryMaxSO = "SELECT MAX(\"SALESORDERID\") AS MAXID FROM \"sap.hana.democontent.epmNext.data::SO.Header\"";
        var rsMax = conn.executeQuery(query);
        for(var i = 0; i < rsMax.length; i++){
            maxSoId = rsMax[i].MAXID;
        }

        //batch inserts
        var itemArray = [];
        var headArray = [];
        for (i = 0; i < BATCHSIZE; i++) {

            //Randomly extract the product and the corresponding price of the selected product
            randProductIndex = Math.floor(Math.random() * 105);
            randProduct = prodDict[randProductIndex].prod;
            randPrice = prodDict[randProductIndex].price;

            //Creating values to be inserted purchaseOrderItem table			
            maxSoId = parseInt(maxSoId, 10) + 1;
            maxSoId = maxSoId.toString();
            randQuantity = Math.floor((Math.random() * 9) + 1);
            randNetAmount = parseInt((randQuantity * randPrice).toFixed(2), 10);
            randTaxAmount = parseInt((randNetAmount * 0.19).toFixed(2), 10); // Taking 19% Tax
            randGrossAmount = randNetAmount + randTaxAmount;
            
            itemArray.push(["0" + maxSoId,"0000000010",randProduct,"NoteId","EUR",randGrossAmount,randNetAmount,randTaxAmount,"I","?",randQuantity,"EA",StartDateStr]);

            //Randomly extract the business partner from businessPartnerArray
            randBPIndex = Math.floor(Math.random() * 44); // since BP is 45
            randBusinessPartner = bpDict[randBPIndex];

            //Creating values to be inserted for the purchaseOrderHeader table
            headArray.push(["0" + maxSoId,"0000000033",StartDateStr,"0000000033",StartDateStr,"NoteId",randBusinessPartner,"EUR",randGrossAmount,randNetAmount,randTaxAmount,"N","I","I"]);
        }
        conn.executeUpdate(query,itemArray);
        conn.executeUpdate(querySO,headArray);
        conn.commit();
        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
    }
}


//Create Sales Orders distributed randomly across a time period
function replicateTimeBasedSalesOrders(aStartDate, aEndDate, aNoRec) {

    var alpha = 0;
    var thetaArray = [];
    var i = 0;
    var randNo = 0;
    var body = '';
    var j;
    var noRecords = aNoRec;
    var calc;
    var tempthetaArray, startDay, startMonth, startYear, StartDateStr, BATCHSIZE;
    //Calculate the number of days
    var StartDate = new Date(aStartDate);
    var endDate = new Date(aEndDate);
    var timeDiff = Math.abs(endDate.getTime() - StartDate.getTime());
    var diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))) + 1;

    if (aNoRec === 0) {
        return;
    }

    //Get the random number of purchase orders to be generated for each day finally stored in thetaArray[]
    randNo = Math.random();
    alpha = Math.round(aNoRec / diffDays);
    thetaArray[0] = Math.round(alpha * randNo);
    aNoRec = +(aNoRec - thetaArray[i]) || 0;

    for (i = 1; i < diffDays - 1; i++) {
        //Generate a random number
        randNo = Math.random();
        alpha = Math.round(aNoRec / (diffDays - i));
        calc = Math.round(alpha * randNo) * Math.round(6 * randNo);
        thetaArray[i] = (calc <= aNoRec) ? calc : 0;
        aNoRec = +(aNoRec - thetaArray[i]) || 0;
    }

    thetaArray[diffDays - 1] = +aNoRec || 0;

    //Loop to distribute the random purchase orders to be generated accross each day(date) and also calculate the BATCHSIZE
    for (j = 0; j < diffDays; j++) {
        tempthetaArray = thetaArray[j];
        startDay = StartDate.getDate();
        startMonth = StartDate.getMonth() + 1; // Jan is 0
        startYear = StartDate.getFullYear();
        if (thetaArray[j] === 0) {
            continue;
        }
        if (startDay < 10) {
            startDay = '0' + startDay;
        }
        if (startMonth < 10) {
            startMonth = '0' + startMonth;
        }
        StartDateStr = startYear.toString() + startMonth.toString() + startDay;
        if (tempthetaArray !== 0) {
            BATCHSIZE = thetaArray[j];
            if (BATCHSIZE === 1) {
                createTimeBasedSOBSOne(StartDateStr);
            } else {
                createTimeBasedSO(StartDateStr, BATCHSIZE);
            }
        }
        // Increment Date
        StartDate.setDate(StartDate.getDate() + 1);
    }
    //Update sequence
    dg.resetTableSequence('salesOrderId');
    body = body + MESSAGES.getMessage('SEPM_ADMIN', '001', noRecords,
        'Sales.Header') + "\n";

    $.response.status = $.net.http.OK;
    $.response.setBody(body);
}

//Get size of all tables and their names in a two dimensional array
function getTableSize() {
    var i = 0;
    var body = '';
    var list = [];
    var conn = '';
    var query, pstmt, rs, query2, pstmt2, rs2;

    function createTotalEntry(rs, table, rs2) {

        var record_count = Math.round(rs.RECS);
        var table_size = Math.round(rs2.TABLE_SIZE / 1024);


        return {
            "name": table,
            "table_size": table_size,
            "record_count": record_count
        };

    }
    var tableDict = [{
        "tableName": "MD.Addresses",
        "tableSynonym": "Address"
    }, {
        "tableName": "MD.BusinessPartner",
        "tableSynonym": "Business Partner"
    }, {
        "tableName": "Util.Constants",
        "tableSynonym": "Constants"
    }, {
        "tableName": "MD.Employees",
        "tableSynonym": "Employees"
    }, {
        "tableName": "Util.Messages",
        "tableSynonym": "Messages"
    }, {
        "tableName": "MD.Products",
        "tableSynonym": "Products"
    }, {
        "tableName": "PO.Header",
        "tableSynonym": "Purchase Order Headers"
    }, {
        "tableName": "PO.Item",
        "tableSynonym": "Purchase Order Items"
    }, {
        "tableName": "SO.Header",
        "tableSynonym": "Sales Order Headers"
    }, {
        "tableName": "SO.Item",
        "tableSynonym": "Sales Order Items"
    }, {
        "tableName": "Util.Texts",
        "tableSynonym": "Texts"
    }];
    conn = $.hdb.getConnection();
    for (var i = 0; i < tableDict.length; i++) {
        query = 'SELECT COUNT(*) AS RECS FROM "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::' + tableDict[i].tableName + '"';

        rs = conn.executeQuery(query);
        query2 = 'SELECT "TABLE_SIZE" FROM "SYS"."M_TABLES" WHERE "SCHEMA_NAME" = \'SAP_HANA_EPM_NEXT\' AND "TABLE_NAME" = \'sap.hana.democontent.epmNext.data::' + tableDict[i].tableName + '\'';
        rs2 = conn.executeQuery(query2);

       // for(var ilen = 0; ilen < rs.length; ilen++){
            list.push(createTotalEntry(rs[0], tableDict[i].tableSynonym, rs2[0]));
       // }

    }
    conn.close();
    body = JSON.stringify({
        "entries": list
    });

    $.response.contentType = 'application/json; charset=UTF-8';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

//Generate synonyms for currency conversion tables
function generateSynonym() {

    // open db connection
    var conn = $.hdb.getConnection();
    var i = 0;
    var body = '';
    var query = '';
    var pstmt;

    var tableArray = ["T006", "T006A", "TCURC", "TCURF", "TCURN", "TCURR",
        "TCURT", "TCURV", "TCURW", "TCURX"
    ];
    for (i = 0; i < tableArray.length; i++) {
        try {
            query = 'DROP SYNONYM "SAP_HANA_EPM_NEXT"."' + tableArray[i] + '" ';
            conn.executeUpdate(query);
        } catch (ignore) {}
    }

    for (i = 0; i < tableArray.length; i++) {
        query = 'CREATE SYNONYM "SAP_HANA_EPM_NEXT"."' + tableArray[i] + '" FOR "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::Conversions.' + tableArray[i] + '"';
        conn.executeUpdate(query);
        body = body + 'Created Synonym: "SAP_HANA_EPM_NEXT"."' + tableArray[i] + ' FOR "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::' + tableArray[i] + '" \n';
    }

    conn.commit();

    $.response.status = $.net.http.OK;
    $.response.setBody(body);

    // close db connection
    conn.close();
}


switch (aCmd) {
    case "reseed":
        reloadSeed();
        break;
    case "resetSequence":
        resetSequence();
        break;
    case "replicatePO":
        replicatePurchaseOrders();
        break;
    case "replicateTimeBasedPO":
        replicateTimeBasedPurchaseOrders(aStartDate, aEndDate, parseInt(aNoRec, 10) * 1000);
        break;
    case "replicateTimeBasedSO":
        replicateTimeBasedSalesOrders(aStartDate, aEndDate, parseInt(aNoRec, 10) * 1000);
        break;
    case "replicateSO":
        replicateSalesOrders();
        break;
    case "getSize":
        getTableSize();
        break;
    case "synonym":
        generateSynonym();
        break;
    case "getSessionInfo":
        fillSessionInfo();
        break;
    default:
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));

}
