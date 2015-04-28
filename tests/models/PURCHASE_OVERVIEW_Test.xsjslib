/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PURCHASE_OVERVIEW
 * Mock the model, its dependent tables i)PO.Header ii)PO.Item and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model returns purchase overview
 */
describe('PURCHASE_OVERVIEW', function() {
	var sqlExecutor = null;
	var testEnvironment = null;

/*Creates a new purchase order for given purchaseOrderId,productId */
	function createPurchaseOrder(purchaseOrderId,productId)
	{
	 	var headerData = {
		    "PURCHASEORDERID" : [purchaseOrderId],
		    "HISTORY.CREATEDAT" :["2014-03-03"],
		    "LIFECYCLESTATUS" : ["L"]
		};
		var itemData = {
		    "PURCHASEORDERID" : [purchaseOrderId],
		    "PURCHASEORDERITEM" : ["1010"],
		    "PRODUCT.PRODUCTID" : [productId],
		    "CURRENCY" : ["INR"],
		    "NETAMOUNT" : ["500"],
		    "TAXAMOUNT" : ["100"],
		    "QUANTITY" : ["3"],
		    "QUANTITYUNIT" : ["EA"]
		};
        var productData = {
		    "PRODUCTID" : [productId]
		};
		
		testEnvironment.fillTestTable("poHeader",headerData);
		testEnvironment.fillTestTable("poItem",itemData);
		testEnvironment.fillTestTable("product",productData);
   
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
					name : 'sap.hana.democontent.epmNext.models/PURCHASE_OVERVIEW'
				},
				substituteTables : {
					"poHeader" : 'sap.hana.democontent.epmNext.data::PO.Header',
					"poItem" : 'sap.hana.democontent.epmNext.data::PO.Item'
				},
				substituteViews : {
			    "product" : {
			        schema : '_SYS_BIC',
			        name:'sap.hana.democontent.epmNext.models/PROD'
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
	
/* check if the test model is created and doesnt contain any data */
	it('should not return any result when there are no purchase order', function() {
		var actualData = sqlExecutor.execQuery('select PURCHASEORDERID from ' + testEnvironment.getTestModelName() + ' group by PURCHASEORDERID');
		expect(actualData).toMatchData({}, [ "PURCHASEORDERID" ]);
	});

/*create purchase orders and check if the test model returns purchase overview */
	it('should return the purchase overview', function() {
		var purchaseOrderId = 1000, productId = 1234;
	    createPurchaseOrder(purchaseOrderId,productId);
	    createPurchaseOrder(++purchaseOrderId,productId);
		var expectedData = {
		    "LIFECYCLESTATUS" : ["L"],
		    "PURCHASEORDERITEM" : ["1010"],
		    "CURRENCY" : ["INR"],
		    "QUANTITYUNIT" : ["EA"],
		    "QUANTITY" : [6],
			"NETAMOUNT" : [1000],
			"TAXAMOUNT" : [200]
		};
		
		var actualData = sqlExecutor.execQuery('select LIFECYCLESTATUS,PURCHASEORDERITEM,CURRENCY,QUANTITYUNIT,SUM(QUANTITY) as QUANTITY,SUM(NETAMOUNT) as NETAMOUNT,SUM(TAXAMOUNT) as TAXAMOUNT  from ' + testEnvironment.getTestModelName()  + ' group by PRODUCTID,LIFECYCLESTATUS,PURCHASEORDERITEM,CURRENCY,QUANTITYUNIT');
		expect(actualData).toMatchData(expectedData, [ "NETAMOUNT" ]);
	});
}).addTags(["models"]);