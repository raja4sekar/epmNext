/*global jasmine, describe, beforeOnce, beforeEach, it, xit, expect*/
var SqlExecutor = $.import('sap.hana.testtools.unit.util', 'sqlExecutor').SqlExecutor;
var mockstarEnvironment = $.import('sap.hana.testtools.mockstar', 'mockstarEnvironment');
var tableDataSet = $.import('sap.hana.testtools.unit.util', 'tableDataSet');

/**
 * Test suite to test get_session_variable.hdbprocedure
 * Mock the procedure, its dependent table i)EPM.Util.SSCOOKIE and store it in a test Schema
 * Insert test data to the dependent table
 * Check if the procedure returns session variable for  the given sessionId
 */
describe('get_session_variable', function() {
    var testEnvironment = null;
    
    function createSessionData(sessionId) {
            var sessionData = {
                "SESSIONID": sessionId,
                "NAME": "SHINE",
                "APPLICATION": "SHINE",
                "EXPIRY": "20.07.2014",
                "DATA": "TEST"
            };
            /* Insert the data to test table */
            testEnvironment.fillTestTable("scookie", sessionData);
        }
        
    /* returns the sessionData */
    function getSessionVariable(sessionId,name,application) {
            var callStatement = 'call ' + testEnvironment.getTestModelName() + '(\'' + sessionId + '\', \'' + name + '\',\'' + application + '\',? )';
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
            schema: 'SAP_HANA_EPM_NEXT',
            model: {
                schema: 'SAP_HANA_EPM_NEXT',
                name: 'sap.hana.democontent.epmNext.procedures/get_session_variable'
            },
            substituteTables: {
                "scookie": 'sap.hana.democontent.epmNext.data::Util.SSCOOKIE'
            }
        };
        testEnvironment = mockstarEnvironment.defineAndCreate(definition);
    });

/* clear the test tables before executing every spec */
    beforeEach(function() {
        testEnvironment.clearAllTestTables();
    });

/* check if it returns the session variable for the given sessionId */
    it('Should return the session variable', function() {
        createSessionData(1000);
        var expectedData = {
            'SESSIONID': ['1000'],
            'NAME': ['SHINE'],
            'APPLICATION': ['SHINE'],
            'DATA': ['TEST']
        };
        expect(getSessionVariable('1000','SHINE','SHINE')).toMatchData(expectedData, ["SESSIONID", "NAME"]);
    });
}).addTags(["procedures"]);