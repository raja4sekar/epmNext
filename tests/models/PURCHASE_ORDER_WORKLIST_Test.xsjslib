/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/

/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');

/**
 * Test suite to test PURCHASE_ORDER_WORKLIST
 * Mock the model, its dependent tables
 *  i) 'sap.hana.democontent.epmNext.data::PO.Header',
    ii)'sap.hana.democontent.epmNext.data::PO.Item',
	iii) 'sap.hana.democontent.epmNext.data::MD.BusinessPartner',
	iV) 'sap.hana.democontent.epmNext.data::MD.Products', 
	v) 'sap.hana.democontent.epmNext.data::MD.Addresses',
	vi)'sap.hana.democontent.epmNext.data::Util.Texts',
	vii)'sap.hana.democontent.epmNext.data::Util.Constants'
 *  and store it in a test Schema
 * Insert test data to the dependent tables
 * Check if the model performs join of its dependent tables
 */

describe('PURCHASE_ORDER_WORKLIST', function () {
	var sqlExecutor = null;
	var testEnvironment = null;

/* Creates new PO orders along with BP and appropriate status */	
	function createHeaderData(poId, bpId)
    {
       var headerData = {
            "PURCHASEORDERID": poId,
            "PARTNER.PARTNERID": bpId,
            "CURRENCY": "EUR",
            "GROSSAMOUNT": "2166",
            "LIFECYCLESTATUS": "L",
            "APPROVALSTATUS": "A",
            "CONFIRMSTATUS": "C",
            "ORDERINGSTATUS": "O"
        }; 
       testEnvironment.fillTestTable("poHeader", headerData);
    }
    
/* Creates new PO orders along with item detail */
	
    function createItemData(poId,pdId)
    {
         var itemData = {
            "PURCHASEORDERID": poId,
            "PRODUCT.PRODUCTID": pdId,
            "PURCHASEORDERITEM": "0001",
            "GROSSAMOUNT": "4556",
            "QUANTITY": "2",
            "QUANTITYUNIT": "Num",
            "DELIVERYDATE": "2014-06-13"
        };
         testEnvironment.fillTestTable("poItem", itemData);   
    }
  
 /* Creates new BP  */    
    
   function createBusinessPartnerData(bpId)
   {
       var businessPartnerData = {
            "ADDRESSES.ADDRESSID": "TEST123",
            "PARTNERID" : bpId,
            "COMPANYNAME": "SAP"
        }; 
       testEnvironment.fillTestTable("bpData", businessPartnerData);   
   }

 /* Creates new Product data */
   
   function createProductsData(pdId)
   {
       var productsData = {
            "PRODUCTID": pdId,
            "DESCID": "1000007000",
            "NAMEID": "1000007001",
            "TYPECODE": "PR",
            "CATEGORY": "Product",
            "PRICE": "700",
            "PRODUCTPICURL": "sap/hana/democonent/epmNext/data/images/HT-1060.jpg"
        };
       testEnvironment.fillTestTable("prodData", productsData);   
   }

/* Creates new address data */
   
   function createAddressData()
   {
       var addressData = {
            "ADDRESSID": "TEST123",
            "CITY": "Bangalore",
            "POSTALCODE": "213424"
        }; 
       testEnvironment.fillTestTable("addressData", addressData);   
   }

/* Creates new Text ID with text */
   
 function createTextsData()
   {
       var textsData = {
            "TEXTID": "1000007001",
            "TEXT": "Mouse",
            "LANGUAGE": "E"
        }; 
       testEnvironment.fillTestTable("utilText", textsData);   
   }

/* Creates new Text ID with text */
   
   function createProductDescriptionData()
   {
       var productDescriptionData = {
            "TEXTID": "1000007000",
            "TEXT": "Product Description",
            "LANGUAGE": "E"
        };
       
       testEnvironment.fillTestTable("utilText", productDescriptionData);  
   }
   
/* Creates new domain for life cycle of PO  */   
   
   function createConstantData()
   {
       var constantData = {
            "DOMAIN": "D_PO_LC",
            "FIXEDVALUE": "L",
            "LANGUAGE": "E",
            "DESCRIPTION": "LifeCycle Description"
        };
       testEnvironment.fillTestTable("utilCons", constantData); 
   }

/* Creates new domain for Approval  of PO */
   
   function createApprovalConstantData()
   {
        var approvalConstantData = {
            "DOMAIN": "D_PO_AP",
            "FIXEDVALUE": "A",
            "LANGUAGE": "E",
            "DESCRIPTION": "Approval Description"
        };
        testEnvironment.fillTestTable("utilCons", approvalConstantData);
   }
/* Creates new domain for Confirmation of PO  */
   
   function createConfirmConstantData()
    {
         var confirmConstantData = {
            "DOMAIN": "D_PO_CF",
            "FIXEDVALUE": "C",
            "LANGUAGE": "E",
            "DESCRIPTION": "Confrimation Description"
        };
         testEnvironment.fillTestTable("utilCons", confirmConstantData);

    }
   
/* Creates new domain for ordering status of PO  */   
    function createOrderingConstantData()
    {
          var orderingConstantData = {
            "DOMAIN": "D_PO_OR",
            "FIXEDVALUE": "O",
            "LANGUAGE": "E",
            "DESCRIPTION": "Ordering Description"
        };
          testEnvironment.fillTestTable("utilCons", orderingConstantData);

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
					name : 'sap.hana.democontent.epmNext.models/PURCHASE_ORDER_WORKLIST'
				},
				substituteTables : {
					"poHeader" : 'sap.hana.democontent.epmNext.data::PO.Header',
					"poItem" :  'sap.hana.democontent.epmNext.data::PO.Item',
					"bpData" : 'sap.hana.democontent.epmNext.data::MD.BusinessPartner',
					"prodData" : 'sap.hana.democontent.epmNext.data::MD.Products', 
					"addressData" :'sap.hana.democontent.epmNext.data::MD.Addresses',
					"utilText" : 'sap.hana.democontent.epmNext.data::Util.Texts',
					"utilCons" : 'sap.hana.democontent.epmNext.data::Util.Constants'
				}
	};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition);
    });

    beforeEach(function () {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		testEnvironment.clearAllTestTables();
    });

/* check if the test model is created and doesn't contain any data */    
    
    it('should not return any result when there are no products', function () {
        var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
        expect(actualData).toMatchData({}, ["PURCHASEORDERID"]);
    });

/*create PO orders and check if the test model returns the status of the PO */
    
    it('should return values of PO worklist ', function () {
        var poId = "111", bpId = "232", pdId ="123";
    	createHeaderData(poId, bpId);
        createItemData(poId,pdId);
        createBusinessPartnerData(bpId);
        createProductsData(pdId);
        createAddressData();
        createTextsData();
        createProductDescriptionData();
        createConstantData();
        createApprovalConstantData();
        createConfirmConstantData();
        createOrderingConstantData();
       
        var expectedData = {
            "PARTNERID": ["232"],
            "CURRENCY": ["EUR"],
            "GROSSAMOUNT": [2166],
            "PURCHASEORDERID": ["111"],
            "PURCHASEORDERITEM": ["0001"],
            "PRODUCTID": ["123"],
            "QUANTITY": [2],
            "QUANTITYUNIT": ["Num"],
            "COMPANYNAME": ["SAP"],
            "TYPECODE": ["PR"],
            "CATEGORY": ["Product"],
            "PRODUCTNAME": ["Mouse"],
            "CITY": ["Bangalore"],
            "POSTALCODE": ["213424"],
            "PRODUCTDESC": ["Product Description"],
            "GROSSAMOUNT_1": [4556],
            "PRICE": [700],
            "PRODUCTPICURL": ["sap/hana/democonent/epmNext/data/images/HT-1060.jpg"],
            "LIFECYCLEDESC": ["LifeCycle Description"],
            "APPROVALDESC": ["Approval Description"],
            "CONFIRMATIONDESC": ["Confrimation Description"],
            "ORDERINGDESC": ["Ordering Description"]

        };

        var actualData = sqlExecutor.execQuery('select * from ' + testEnvironment.getTestModelName());
        expect(actualData).toMatchData(expectedData, ["PURCHASEORDERID"]);
    });
});