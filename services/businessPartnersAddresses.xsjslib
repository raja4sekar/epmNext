$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session;

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

function bp_create_before_exit(param) {

	let	after = param.afterTableName;
	var pStmt;
	try {

		pStmt = param.connection.prepareStatement('select "sap.hana.democontent.epmNext.data::businessPartnerId".NEXTVAL from dummy');
		var rs = pStmt.executeQuery();
		var PartnerId = '';
		while (rs.next()) {
			PartnerId = rs.getString(1);
		}
		pStmt.close();

		pStmt = param.connection.prepareStatement('update "' + after
				+ '" set PARTNERID = ?,' + 
				  '  PARTNERROLE = ?, ' +
				  '  "HISTORY.CREATEDBY.EMPLOYEEID" = ?,' +
				  '  "HISTORY.CHANGEDBY.EMPLOYEEID" = ?,' +
				  '  "HISTORY.CREATEDAT" = now(),' + 
				  '  "HISTORY.CHANGEDAT" = now(),' + 
				  '  "CURRENCY" = ?');
		pStmt.setString(1, PartnerId);	
		pStmt.setString(2, '01');	
		pStmt.setString(3, '0000000033');
		pStmt.setString(4, '0000000033');
		pStmt.setString(5, 'EUR');		
		
		pStmt.execute();
		pStmt.close();

		
	}
	catch (e) {

	}

}

function address_create_before_exit(param) {

	let	after = param.afterTableName;
	
	var pStmt;
	try {
		
	pStmt = param.connection.prepareStatement('select "sap.hana.democontent.epmNext.data::addressId".NEXTVAL from dummy');
	var rs = pStmt.executeQuery();
	var AddressId = '';
	while (rs.next()) {
		AddressId = rs.getString(1);
	}
	pStmt.close();

	pStmt = param.connection.prepareStatement('update "' + after
			+ '" set "ADDRESSID" = ?,' +
			  'ADDRESSTYPE = ?,' +
			  '"VALIDITY.STARTDATE" = TO_DATE(' + "'2000-01-01', 'YYYY-MM-DD'),"  +
			  '"VALIDITY.ENDDATE" = TO_DATE(' + "'9999-12-31', 'YYYY-MM-DD')" );
	pStmt.setString(1, AddressId);		
	pStmt.setString(2, '02');			
	pStmt.execute();
	pStmt.close();
		
	}
	catch (e) {

	}

}

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {principalTableName} String - The name of a temporary table with the entity type at the principal end of the association
@param {dependentTableName} String -The name of a temporary table with the dependent entity type
 */


function assocation_create_exit(param){
	let	princ = param.principalTableName;
	let	dep = param.dependentTableName;


	var	pStmt = param.connection.prepareStatement('select * from "' + princ + '"');
	var Principal = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), 'Details');
	pStmt.close();
	
	var	pStmt = param.connection.prepareStatement('select * from "' + dep + '"');
	var Dependent = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), 'Details');
	pStmt.close();	
	
	$.trace.debug(JSON.stringify(Principal));
	$.trace.debug(JSON.stringify(Dependent));
	var pStmt = param.connection.prepareStatement('update "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.BusinessPartner" ' +
			    ' SET "ADDRESSES.ADDRESSID" = ? WHERE "PARTNERID" = ? ');
	pStmt.setString(1, Dependent.Details[0].ADDRESSID);
	pStmt.setString(2, Principal.Details[0].PARTNERID);		
	pStmt.execute();
	pStmt.close();	
			
}