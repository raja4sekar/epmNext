var PurchaseOrder = $.import("sap.hana.democontent.epmNext.JavaScriptBasics", "purchaseOrderBasic");

var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var TableUtils = $.import('sap.hana.testtools.unit.util', 'tableUtils').TableUtils;
var mockstar = $.import('sap.hana.testtools.mockstar', 'apiFacade');

describe('Purchase Order (writes into test tables)', function() {
	var sqlExecutor = null;
	var tableUtils = null;
	
	var poTableName = 'sap.hana.democontent.epmNext.data::PO.Header';
	
	var originSchema = 'SAP_HANA_EPM_NEXT';
	var userSchema = $.session.getUsername().toUpperCase();
	
	var purchaseOrder = null;
	var poTable = null;
	
	var keyId = 0;
	var netAmount = 0;
	
	var getNetAmount = function(){
		netAmount = Math.floor(Math.random() * 50000) + 1;
		return netAmount;
	};
	var getKeyId = function() {
		keyId = keyId + 1;
		return keyId.toString();
	};
	
	beforeOnce(function(){
		tableUtils = new TableUtils(jasmine.dbConnection);
		poTable = createTestTable(poTableName);
		tableUtils.clearTableInUserSchema(poTableName);
	});
	
    beforeEach(function() {
    	sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		tableUtils = new TableUtils(jasmine.dbConnection);
		
	});
	
    function createTestTable(originTable) {
		var tableUtils = new TableUtils(jasmine.dbConnection);
		return tableUtils.copyIntoUserSchema(originSchema, originTable);
	}
    
    it('shound insert one entry into PO Header Table', function(){
    	var header = {};
    	header.partnerId = '0100000000';
    	header.currency = 'EUR';
    	var netAmount = new Number(getNetAmount());
    	header.netAmount = netAmount; 
    	var po = new PurchaseOrder.putHeader(getKeyId(),header,userSchema,jasmine.dbConnection);
    	
    	expect(selectAllFromPoTable().getRowCount()).toBe(1);
    	
    });
    
    it('Purchase Order ID should exist', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po.PURCHASEORDERID).toBe(keyId.toString());
    });
    
    it('Partner ID should be 0100000000', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["PARTNER.PARTNERID"]).toBe('0100000000');
    });
    
    it('Created At should be Now', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["HISTORY.CREATEDAT"].toDateString()).toBe(new Date().toDateString());
    });
    
    it('Changed At should be Now', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["HISTORY.CHANGEDAT"].toDateString()).toBe(new Date().toDateString());
    });
    
    it('Lifecycle should be New', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["LIFECYCLESTATUS"]).toBe('N');
    });
    
    it('Net Amount should be equal to random input', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["NETAMOUNT"]).toBe(netAmount);
    });
    
    it('Tax Amount should be 10% of Net Amount', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["TAXAMOUNT"]).toBe(Math.round((netAmount * '.10') * 100)/100);
    });    
    
    it('Gross Amount should be Net plus Tax', function() {
    	var po = new PurchaseOrder.getHeader(keyId,userSchema,jasmine.dbConnection);
    	expect(po["GROSSAMOUNT"]).toBe(po["NETAMOUNT"] + po["TAXAMOUNT"]);
    });
    
    it('shound insert a second entry into PO Header Table', function(){
    	var header = {};
    	header.partnerId = '0100000001';
    	header.currency = 'EUR';
    	var netAmount = new Number(getNetAmount());
    	header.netAmount = netAmount; 
    	var po = new PurchaseOrder.putHeader(getKeyId(),header,userSchema,jasmine.dbConnection);
    	
    	expect(selectAllFromPoTable().getRowCount()).toBe(2);
    	
    });
    
    function selectAllFromPoTable() {
		var selectString = 'select * from ' + poTable;
		var sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		return sqlExecutor.execQuery(selectString);
	}
    
});

describe('PO_BASIC', function(){
	var sqlExecutor = null;
	var tableUtils = null;

	var originSchema = 'SAP_HANA_EPM_NEXT';
	var originTable = 'sap.hana.democontent.epmNext.data::PO.Header';
	var testTable = ''; // contains the user schema
	var testModel = null;

	var userSchema = $.session.getUsername().toUpperCase();

	var keyId = 0;
	var netAmount = 0;
	
	var getNetAmount = function(){
		netAmount = Math.floor(Math.random() * 50000) + 1;
		return netAmount;
	};
	var getKeyId = function() {
		keyId = keyId + 1;
		return keyId.toString();
	};
	
	beforeOnce(function() {
		createTestTables();
		createTestModel();
	});
	
	beforeEach(function() {
		sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		tableUtils = new TableUtils(jasmine.dbConnection);

		tableUtils.clearTableInUserSchema(testTable);
	});
	
	it('should not return any result when there are no POs', function() {
		var actualData = sqlExecutor.execQuery('select * from ' + testModel.runTimePath);
		expect(actualData).toMatchData({}, [ "poId" ]);
	});
	
	it('should return one purchase order', function() {
		var header = {};
    	header.partnerId = '0100000000';
    	header.currency = 'EUR';
    	var netAmount = new Number(getNetAmount());
    	header.netAmount = netAmount; 
    	var po = new PurchaseOrder.putHeader(getKeyId(),header,userSchema,jasmine.dbConnection);

		var expectedData = {
			"poId" : [ keyId.toString() ]
		};
		var actualData = sqlExecutor.execQuery('select * from ' + testModel.runTimePath);
		expect(actualData).toMatchData(expectedData, [ "poId" ]);
		
	});
	
	function createTestTables() {
		var tableUtils = new TableUtils(jasmine.dbConnection);
		testTable = tableUtils.copyIntoUserSchema(originSchema, originTable);
	}

	function createTestModel() {
		grantSelectUserSchemaToSysRepo();
		var originalModel = 'sap.hana.democontent.epmNext.models::PO_BASIC';
		var targetPackage = 'system-local.private.' + $.session.getUsername().toLowerCase();

		var dependencySubstitutions = [];
		dependencySubstitutions.push(buildSubstitutionRule(originSchema + '.' + originTable, testTable));

		testModel = mockstar.createTestModel(originalModel, targetPackage, dependencySubstitutions, mockstar.TruncOptions.FULL);
	}

	function buildSubstitutionRule(originalTableOrView, testTableName) {
		return {
			original : originalTableOrView,
			substitute : testTableName
		};
	}

	function grantSelectUserSchemaToSysRepo() {
		var sqlExecutor = new SqlExecutor(jasmine.dbConnection);
		sqlExecutor.execSingle('grant select on schema "' + userSchema + '" to _SYS_REPO with grant option');
	}

	
});