
var conn = $.hdb.getConnection(); 
var rs,pstmt,pc,result,lv_host,lv_port,config_proper = true;

//check SMTP is configured

try { 
	
	//Check if the the index server parameters for smtp host and port are set
	  var query = 'select * from PUBLIC.M_INIFILE_CONTENTS WHERE FILE_NAME = ? AND LAYER_NAME = ? AND SECTION = ? AND KEY = ?';
      rs = conn.executeQuery(query,'xsengine.ini','SYSTEM','smtp','server_host');  
	  if (rs.length<1) {
	    	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    	$.response.setBody('SMTP is not configured'); 
	    	config_proper = false;
	  }else{
	    	lv_host = rs[0].VALUE;  
	    	
	    	//If host is empty ,throw a response as 'SMTP Host is not configured'
	    	if(lv_host === ""||lv_host === "localhost"){
		    	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		    	$.response.setBody('SMTP Host is not configured '); 
		    	config_proper = false;	}	    	
	    	else{
	    		query = 'select * from PUBLIC.M_INIFILE_CONTENTS WHERE FILE_NAME = ? AND LAYER_NAME = ? AND SECTION = ? AND KEY = ?';
	    		rs = conn.executeQuery(query,'xsengine.ini','SYSTEM','smtp','server_port')
	    		if (rs.length>0) {
	    			lv_port = rs[0].VALUE; 
		    
	    			//If port is empty ,throw a response as 'SMTP Port is not configured'
	    			if(lv_port === ""){
	    				$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	    				$.response.setBody('SMTP Port is not configured '); 
	    				config_proper = false;
	    			}
	    		}
		    }
	  }
	}
 		    
	catch (e){
	   	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	   	$.response.setBody('Mail could not be sent.Check if the mail ID exists and also if SMTP is configured');
	}
		    
		    
 //If the SMTP configuration is set,send an email with the PO ID details to the sender email 
		    if (config_proper === true) {	  
			var email = $.request.parameters.get('email');
			var soid = $.request.parameters.get('soid');
			try{

				var mail = new $.net.Mail({	
					sender:"donotreply@sap.com",
					to: email,
					subject: "New Sales Order " +  soid + " created",
					subjectEncoding: "UTF-8",
					parts: [ new $.net.Mail.Part({
					type: $.net.Mail.Part.TYPE_TEXT,
					text: "A new Sales Order was created with Sales Order ID : " + soid,
					contentType: "text/plain",
					encoding: "UTF-8"
    })]
});
				var returnValue = mail.send(); 
	

				var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;
				$.response.status = $.net.http.OK; 
				$.response.contentType = "text/html";
				$.response.setBody(response);
				}
				catch(e){
					$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
					$.response.setBody('Mail could not be sent.Check if the mail ID exists and also if SMTP is configured');

		}
}
