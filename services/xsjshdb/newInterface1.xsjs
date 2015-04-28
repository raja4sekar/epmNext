var connection = $.hdb.getConnection();
/*var results = connection.executeQuery(
		'SELECT * FROM "sap.hana.democontent.epmNext.data::MD.Employees" ' +
			'WHERE LOGINNAME <> ?', 'EPM_USER');*/
var results = connection.executeQuery(
'SELECT to_int(MAX("TEXTID") + 1) FROM "sap.hana.democontent.epmNext.data::Util.Texts" ' );
$.response.setBody(JSON.stringify(results));