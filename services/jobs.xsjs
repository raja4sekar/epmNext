function createEntry(){
	
	
	var conn = $.hdb.getConnection();

	var query = 'insert into "sap.hana.democontent.epmNext.data::JobsDemo.Details" values (now(), ' +
                "'Inserted via XSJS'" + ')';
	conn.executeUpdate(query);
	
	conn.commit();
	conn.close();

}

