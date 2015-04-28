/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_ORDER_RANKING 
 * Mock the model, its dependant tables i) MD.Addresses ii) MD.BusinessPartner and store it in a test Schema
 * Insert test data to the dependant tables
 * Check if the model performs join of its dependant tables
 */
 
describe('SALES_ORDER_RANKING', function() {
	
	var sqlExecutor = null;
	var testEnvironment = null;
	
/* Creates a new Sales Order */
	function createSalesOrder(salesOrderID){
	    var headerData = {
		    "SALESORDERID" : salesOrderID,
		    "PARTNER.PARTNERID" : "5432",
		    "HISTORY.CREATEDAT" : "20140303"
		};
		var itemData = {
		    "SALESORDERID" : salesOrderID,
		    "SALESORDERITEM" : "3333",
		    "PRODUCT.PRODUCTID" : "1234",
		    "NETAMOUNT" : "200"
		};
        var prodData = {
		    "PRODUCTID" : "1234"
		};
		var buyerData = {
		    "PARTNERID" : "5432",
		    "POSTALCODE" : "5600",
		    "COMPANYNAME" : "SAP"
		};
		var timeData = {
		    "DATE_SQL" : "20140701"
		};
	    testEnvironment.fillTestTable("soHeader",headerData);
		testEnvironment.fillTestTable("soItem",itemData);
		testEnvironment.fillTestTable("product",prodData);
		testEnvironment.fillTestTable("buyer",buyerData);
		testEnvironment.fillTestTable("time",timeData);
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
					name : 'sap.hana.democontent.epmNext.models/SALES_ORDER_RANKING'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epmNext.data::SO.Header',
					"soItem" : 'sap.hana.democontent.epmNext.data::SO.Item'
				},
				
				
				substituteViews : {
					"product" : {
					    schema : '_SYS_BIC',
			            name: 'sap.hana.democontent.epmNext.models/PROD'
					},
					"buyer" :{
					    schema : '_SYS_BIC',
			            name: 'sap.hana.democontent.epmNext.models/BUYER'
					 },
					"time" :{
					     schema : '_SYS_BIC',
			             name:'sap.hana.democontent.epmNext.models/TIME_DIM'
					}
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
	});

/* check if the test model is created and doesn't contain any data */
	it('should not return any data when there are no salesorders', function() {
		var actualData = sqlExecutor.execQuery('select SALESORDERID from ' + testEnvironment.getTestModelName() + ' group by SALESORDERID');
		expect(actualData).toMatchData({}, [ "SALESORDERID" ]);
	});

/*create sales orders and check if the test model returns sales order */	
	it('should return sales order', function() {
		createSalesOrder('1111');
		var expectedData = {
		    "SALESORDERID" : ["1111"],
		    "SALESORDERITEM" : ["3333"],
		    "NETAMOUNT" : [200]
		};
		var actualData = sqlExecutor.execQuery('select SALESORDERID, SALESORDERITEM, SUM("NETAMOUNT") as "NETAMOUNT"  from ' +
		                 testEnvironment.getTestModelName() + ' group by SALESORDERID, SALESORDERITEM');
		expect(actualData).toMatchData(expectedData, [ "SALESORDERID" ]);
	});
	
	it('Should calculate sum of NetAmount grouped by salesOrderItem',function(){
		createSalesOrder('1111');
		createSalesOrder('1112');
		var expectedData = {
			"SALESORDERITEM" : ["3333"],
		    "NETAMOUNT" : [400]
		};
		var actualData = sqlExecutor.execQuery('select SALESORDERITEM, SUM("NETAMOUNT") as "NETAMOUNT"  from ' + testEnvironment.getTestModelName() + ' group by SALESORDERITEM');
		expect(actualData).toMatchData(expectedData, [ "NETAMOUNT" ]);
	});
}).addTags(["models"]);	
