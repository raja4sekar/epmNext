/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_OVERVIEW_WO_CURR_CONV
 * Mock the model, its dependent tables 
 * i) sap.hana.democontent.epmNext.data::SO.Header,
 * ii)sap.hana.democontent.epmNext.data::SO.Item, 
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependant tables
 */

describe('SALES_OVERVIEW_WO_CURR_CONV', function() {
	var sqlExecutor = null;
	var testEnvironment = null;
/* Creates new sales orders */	
function createSalesOrder(salesOrderID){
	    var headerData = {
		    "SALESORDERID" : salesOrderID,
		    "CURRENCY" : "INR",
		    "LIFECYCLESTATUS" : "A",
		    "DELIVERYSTATUS" : "A",
		    "HISTORY.CREATEDAT" : "20140303",
		    "BILLINGSTATUS" : "A",
		    "HISTORY.CREATEDBY.EMPLOYEEID" : "TestAD", 
		    "PARTNER.PARTNERID" : "5432"
		};
		var itemData = {
		    "SALESORDERID" : salesOrderID,
		    "SALESORDERITEM" : "3333",
		    "QUANTITYUNIT" : "NO",
		    "PRODUCT.PRODUCTID" : "1234",
		    "QUANTITY" : "2",
		    "NETAMOUNT" : "200",
		    "TAXAMOUNT" : "50"
	};
 		var buyerData = {
 		    "PARTNERID" : "5432"
 		};
        var prodData = {
		    "PRODUCTID" : "1234",
		    "POSTALCODE" : "5600",
		    "COMPANYNAME" : "SAP"
		};
		
		testEnvironment.fillTestTable("soHeader",headerData);
		testEnvironment.fillTestTable("soItem",itemData);
		testEnvironment.fillTestTable("buyer",buyerData);
		testEnvironment.fillTestTable("product",prodData);
		
	}
	
/**
 * Define the model definition
 * create an instance of mockstarEnvironment object : 'testEnvironment'
 * The test model and defined test tables are created
 */
 
	beforeOnce(function() {
		var definition = {
				schema : 'SAP_HANA_EPM_NEXT',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epmNext.models/SALES_OVERVIEW_WO_CURR_CONV'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epmNext.data::SO.Header',
					"soItem" : 'sap.hana.democontent.epmNext.data::SO.Item'
				},
				
				substituteViews : {
				  	"buyer": {
			        schema : '_SYS_BIC',
			        name: 'sap.hana.democontent.epmNext.models/BUYER'
			    },
			    "product": {
			        schema : '_SYS_BIC',
			        name: 'sap.hana.democontent.epmNext.models/PROD'
			     }
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec*/

	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

/* check if the test model is created and doesn't contain any data */

	it('should not return any data when there are no salesorders', function() {
		var actualData = sqlExecutor.execQuery('select SALESORDERID from ' + testEnvironment.getTestModelName() + ' group by SALESORDERID');
		expect(actualData).toMatchData({}, [ "SALESORDERID" ]);
	});

/*create sales orders and check if the test model returns sales overview */
it('should return overview of salesorder', function() {
		createSalesOrder("1111");
		var expectedData = {
		    "SALESORDERID" : ["1111"],
		    "SALESORDERITEM" : ["3333"],
		    "CURRENCY" : ["INR"],
		    "LIFECYCLESTATUS" : ["A"],
		    "DELIVERYSTATUS" : ["A"],
		    "QUANTITYUNIT" : ["NO"],
		    "BILLINGSTATUS" : ["A"],
		    "NETAMOUNT" : [200],
		    "HISTORY_CREATEDBY" : ["TestAD"],
		    "TAXAMOUNT" : [50]
		};
 		var actualData = sqlExecutor.execQuery('select CURRENCY, LIFECYCLESTATUS, DELIVERYSTATUS, POSTING_DATE as HISTORY_CREATEDAT, SALESORDERID, SALESORDERITEM, QUANTITYUNIT, BILLINGSTATUS,' +
 		' SUM("NETAMOUNT") as "NETAMOUNT", HISTORY_CREATEDBY, SUM("TAXAMOUNT") as "TAXAMOUNT"  from ' +
 		 testEnvironment.getTestModelName() + ' group by CURRENCY, LIFECYCLESTATUS, DELIVERYSTATUS, POSTING_DATE, SALESORDERID, SALESORDERITEM, QUANTITYUNIT, BILLINGSTATUS, HISTORY_CREATEDBY');
         expect(actualData).toMatchData(expectedData, [ "SALESORDERID" ]);
	});
	

}).addTags(["models"]);
