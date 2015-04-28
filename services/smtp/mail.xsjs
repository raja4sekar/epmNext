 //create email from JS Object and send 
 try {
var mail = new $.net.Mail({
    sender: {address: "noreply@sap.com"},
    to: [{ address: "rich.heilman@sap.com"}],
    subject: "XSJS Email Test",
    parts: [ new $.net.Mail.Part({
        type: $.net.Mail.Part.TYPE_TEXT,
        text: "Great Job on the openSAP course",
        contentType: "text/plain"
    })]
});
var returnValue = mail.send(); 
//var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;

$.response.status = $.net.http.OK; 
$.response.contentType = "text/html";
//$.response.setBody(response); 

} catch(e){
    
}