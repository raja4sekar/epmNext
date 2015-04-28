var conn = $.hdb.getConnection();
var resbody;
try{
	
	//check if DG is being executed already and a thread is running in the system
	 var query = 'select * from "SYS"."M_SERVICE_THREADS" where "THREAD_METHOD" = \'HTTP\' AND "THREAD_STATE" = \'Running\' AND "THREAD_DETAIL" like \'%/sap/hana/democontent/epmNext/admin/DataGen.xsjs%\'';
	
	var rs = conn.executeQuery(query);
	if(rs.length > 0){
		resbody = "1";
		$.response.status = $.net.http.OK;
		$.response.setBody(resbody);
	}else{
		resbody = "0";
		$.response.status = $.net.http.OK;
		$.response.setBody(resbody);
	}
	conn.close();
}catch (e){
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(e.message);	
}