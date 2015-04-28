/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test SALES_ORDER_WORKLIST
 * Mock the model, its dependent tables
 *  i) 'sap.hana.democontent.epmNext.data::SO.Header',
    ii)'sap.hana.democontent.epmNext.data::SO.Item',
	iii) 'sap.hana.democontent.epmNext.data::MD.BusinessPartner',
	iV) 'sap.hana.democontent.epmNext.data::MD.Products', 
	v) 'sap.hana.democontent.epmNext.data::MD.Addresses',
	vi)'sap.hana.democontent.epmNext.data::Util.Texts',
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */

describe('SALES_ORDER_WORKLIST', function () {
	var sqlExecutor = null;
	var testEnvironment = null;

/* Creates new address data */
	
	function createAddressData(adId)
    { 
        var addressData = {
            "ADDRESSID": adId,
            "CITY": "Bangalore",
            "POSTALCODE": "213424"
        };
        testEnvironment.fillTestTable("addressData", addressData); 
    }
	
/* Creates new BP  */      
  
	function createBusinessPartnerData(bpId,adId)
    {
          var businessPartnerData = {
            "ADDRESSES.ADDRESSID": adId,
            "PARTNERID": bpId,
            "COMPANYNAME": "SAP"
        };
          testEnvironment.fillTestTable("bpData", businessPartnerData);  
    }

/* Creates new SO orders along with BP and appropriate status */
   
    function createHeaderData(soId,bpId)
    {
        var headerData = {
            "SALESORDERID": soId,
            "PARTNER.PARTNERID": bpId,
            "CURRENCY": "EUR",
            "GROSSAMOUNT": "2166",
            "LIFECYCLESTATUS": "C"
        };
        testEnvironment.fillTestTable("soHeader", headerData); 
    }
    
/* Creates new SO orders along with item detail */
    
    function createItemData(soId,pdId)
    {
        var itemData = {
            "SALESORDERID": soId,
            "PRODUCT.PRODUCTID": pdId,
            "SALESORDERITEM": "MOUSE",
            "QUANTITY": "2",
            "QUANTITYUNIT": "2"
        };
        testEnvironment.fillTestTable("soItem", itemData);  
    }

/* Creates new Product data */
    
    function createProductsData(pdId)
    {
        var productsData = {
            "PRODUCTID": pdId,
            "DESCID": "1000007000",
            "NAMEID": "1000007001",
            "TYPECODE": "PR",
            "CATEGORY": "Product"
        };
        testEnvironment.fillTestTable("prodData", productsData); 
    }
    
/* Creates new Text ID with text */    
    
    function createTextsData()
    {
         var textsData = {
            "TEXTID": "1000007001",
            "LANGUAGE": "E",
            "TEXT": "Mouse"
        };
         testEnvironment.fillTestTable("utilText", textsData); 
    }
   
/* Creates new Text ID with text */
    
    function createProductDescriptionData()
    {
         var productDescriptionData = {
            "TEXTID": "1000007000",
            "LANGUAGE": "E",
            "TEXT": "Product Description"
        };

         testEnvironment.fillTestTable("utilText", productDescriptionData);  
    }
    
/**
 * Define the model definition
 * create an instance of mockstarEnvironment object : 'testEnvironment'
 * The test model and defined test tables are created
*/	
    
   beforeOnce(function () {
    	var definition = {
				schema : 'SAP_HANA_EPM_NEXT',
				model : {
					schema : '_SYS_BIC',
					name : 'sap.hana.democontent.epmNext.models/SALES_ORDER_WORKLIST'
				},
				substituteTables : {
					"soHeader" : 'sap.hana.democontent.epmNext.data::SO.Header',
					"soItem" :  'sap.hana.democontent.epmNext.data::SO.Item',
					"bpData" : 'sap.hana.democontent.epmNext.data::MD.BusinessPartner',
					"prodData" : 'sap.hana.democontent.epmNext.data::MD.Products', 
					"addressData" :'sap.hana.democontent.epmNext.data::MD.Addresses',
					"utilText" : 'sap.hana.democontent.epmNext.data::Util.Texts'
					
				}
	};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition);
    });
    
    beforeEach(function () {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
    });
    
    it('should not return any result when there are no Sales Order', function () {
        var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
        expect(actualData).toMatchData({}, ["SALESORDERID"]);
    });

    it('should return values of SO Worklist ', function () {
        var soId = "111", pdId ="123", bpId ="232",adId = "TEST123";
        createAddressData(adId);
        createBusinessPartnerData(bpId,adId);
        createHeaderData(soId,bpId);
        createItemData(soId,pdId);
        createProductsData(pdId);
        createTextsData();
        createProductDescriptionData();
  
        var expectedData = {
        		
            "PARTNERID": ["232"],
            "SALESORDERID": ["111"],
            "PRODUCTID": ["123"],
            "CURRENCY": ["EUR"],
            "GROSSAMOUNT": [2166],
            "LIFECYCLESTATUS": ["C"],
            "SALESORDERITEM": ["MOUSE"],
            "QUANTITY": [2],
            "QUANTITYUNIT": ["2"],
            "COMPANYNAME": ["SAP"],
            "TYPECODE": ["PR"],
            "CATEGORY": ["Product"],
            "CITY": ["Bangalore"],
            "POSTALCODE": ["213424"],
            "PRODUCTNAME": ["Mouse"],
            "PRODUCTDESC": ["Product Description"],
            
        };
        var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
        expect(actualData).toMatchData(expectedData, ["SALESORDERID"]);
    });
});