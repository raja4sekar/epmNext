/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
/*Import Required classes */
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_application_variable.hdbprocedure
 * Mock the procedure, its dependent table
 *  i)Util.SSCOOKIE and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns application Variable
 */
describe('get_application_variable', function() {
	var testEnvironment = null;
	
/* returns the sale price for the given productId */
	function createApplicationData(){
	    var applicationData = {
		    "SESSIONID" : "",
		    "NAME" : "I045205",
		    "APPLICATION" : "SHINE",
		    "EXPIRY" : "20.07.2014",
		    "DATA" : "SAP"
		 };
/* Insert the data to test table */
     testEnvironment.fillTestTable("scookie",applicationData);		
	}
	
	function getApplicationVariable(name,application){
	    var callStatement = 'call ' + testEnvironment.getTestModelName()  + '(\'' + name + '\',\'' + application + '\',? )';
        var callable = jasmine.dbConnection.prepareCall(callStatement);
        callable.execute();
        var resultSet = tableDataSet.createFromResultSet(callable.getResultSet());
        callable.close();
        return resultSet;
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
					schema : 'SAP_HANA_EPM_NEXT',
					name : 'sap.hana.democontent.epmNext.procedures/get_application_variable'
				},
				substituteTables : {
					"scookie" : 'sap.hana.democontent.epmNext.data::Util.SSCOOKIE'
				}
		};
		testEnvironment = mockstarEnvironment.defineAndCreate(definition); 
	});

/* clear the test tables before executing every spec */
	beforeEach(function() {
		testEnvironment.clearAllTestTables();
	});

/* check if it returns the application Variable  */
	 it('Should return application variable', function() {
		 createApplicationData();
	    var expectedData ={
		    "SESSIONID" : [ "" ],
		    "NAME" : ["I045205"],
		    "APPLICATION" : ["SHINE"]
		};
 		expect(getApplicationVariable('I045205','SHINE')).toMatchData(expectedData, ["NAME"]);
	});
}).addTags(["procedures"]);
