
var user = $.session.getUsername();
var targetSchema = $.request.parameters.get('schema');
	
	
var conn = $.db.getConnection("sap.hana.democontent.epmNext.services::externalDebugProcConn");
var pStmt = conn.prepareStatement("select CURRENT_USER from dummy");
var body = '';
var rs = pStmt.executeQuery(); if (rs.next()) { body = rs.getNString(1); } rs.close(); pStmt.close();
var targetUser = body;
body += ' has been setup to debug schema ' + targetSchema; 

var pstmt = conn.prepareStatement( 'GRANT ATTACH DEBUGGER TO '+user );
pstmt.executeUpdate();
pstmt.close();

var pstmt = conn.prepareCall( 'CALL "_SYS_REPO"."GRANT_SCHEMA_PRIVILEGE_ON_ACTIVATED_CONTENT"(?, ?, ?)' );
pstmt.setString(1, 'DEBUG');
pstmt.setString(2, targetSchema);
pstmt.setString(3, targetUser);

pstmt.execute();
pstmt.close();

conn.commit();
conn.close();

$.response.setBody( body );

//GRANT ATTACH DEBUGGER TO <USER> -- Must run as SAP<SID>

//CALL "_SYS_REPO"."GRANT_SCHEMA_PRIVILEGE_ON_ACTIVATED_CONTENT"('DEBUG', '<SCHEMA_NAME>', '<SAPSID>')
