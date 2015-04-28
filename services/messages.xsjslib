function escape(v1){
	var v2 = v1.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	return v2;   
}

function getMessage(messageClass,messageNumber,p1,p2,p3,p4){
	var messageText = '';
	var lang = $.session.language.substring(0,2);
		
	var conn = $.hdb.getConnection();
    
	var query = 'SELECT "DESCRIPTION" FROM "sap.hana.democontent.epmNext.data::Util.Messages" ' +
		         'WHERE "MESSAGECLASS" = ? AND "MESSAGENUMBER" = ? AND "LANGUAGE" = ? ';
	var rs = conn.executeQuery(query,messageClass,messageNumber,lang); 
		
    if(rs.length > 0) {
       messageText = rs[0].DESCRIPTION;}
    else{
    	 lang = 'en';
         rs = conn.executeQuery(query,messageClass,messageNumber,lang);
         if(rs.length > 0) {
             messageText = rs[0].DESCRIPTION;}
    }
 	
    if(p1) { messageText = messageText.replace("&1", escape(p1.toString())); }
    if(p2) { messageText = messageText.replace("&2", escape(p2.toString())); }
    if(p3) { messageText = messageText.replace("&3", escape(p3.toString())); }
    if(p4) { messageText = messageText.replace("&4", escape(p4.toString())); }
	return messageText;
}



