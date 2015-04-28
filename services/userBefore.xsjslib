/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

function create_before_exit(param) {

	let	after = param.afterTableName;

	//Get Input New Record Values
	var	pStmt = param.connection.prepareStatement('select * from "' + after + '"');
	var rs = pStmt.executeQuery();
	var Email = '';
	while (rs.next()) {
		Email = rs.getString(4);
	}
	//Validate Email
	if(!validateEmail(Email)){
		throw 'Invalid email  ' + 
        ' No Way! E-Mail must be valid and ' + Email + ' has problems';
	} 
	
	
	
	var pStmt;
	try {

		pStmt = param.connection
				.prepareStatement('select "sap.hana.democontent.epmNext.data::purchaseOrderId".NEXTVAL from dummy');
		var rs = pStmt.executeQuery();
		var PersNo = '';
		while (rs.next()) {
			PersNo = rs.getString(1);
		}
		pStmt.close();
		pStmt = param.connection.prepareStatement("update\"" + after
				+ "\"set PERS_NO = ?");
			pStmt.setString(1, PersNo);
		pStmt.execute();
		pStmt.close();

		
	}
	catch (e) {
		pStmt.close();
	}

}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 