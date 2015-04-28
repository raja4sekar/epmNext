function doSomething(a){
	var conn = $.db.getConnection();
	var pStmt;
	pStmt = conn.prepareStatement('insert into "sap.hana.democontent.epmNext.data::JobsDemo.Details" values (now(), ' +
			                            "'Inserted via XSJS Response Callback'" + ')' );
	pStmt.executeUpdate();
	pStmt.close();
	conn.commit();
	conn.close();
}