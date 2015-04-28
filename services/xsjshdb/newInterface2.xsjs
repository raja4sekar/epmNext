var connection = $.hdb.getConnection();
var results = connection.executeQuery(
		'SELECT * FROM "sap.hana.democontent.epmNext.data::MD.Employees" ' +
			'WHERE LOGINNAME <> ?', 'EPM_USER');
var row = results[0]
$.response.setBody(JSON.stringify(row));