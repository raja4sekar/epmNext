var connection = $.hdb.getConnection();
var results = connection.executeQuery(
		'SELECT * FROM "sap.hana.democontent.epmNext.data::MD.Employees" ' +
			'WHERE LOGINNAME <> ?', 'EPM_USER');
var email = results[0]['EMAILADDRESS'];
$.response.setBody(email);