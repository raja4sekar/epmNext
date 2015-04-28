var utilsLib = $.import("sap.hana.xs.dt.base.server", "utilsLib");
var objectsLib = $.import("sap.hana.xs.dt.base.server", "objectsLib");
var XSDS = $.import("sap.hana.xs.libs.dbutils", "xsds");

//create email from JS Object and send 
var mail = new $.net.Mail({
    sender: {address: "nopreply@sap.com"},
    to: [{ address: "test@sap.com"}],
    subject: "XSJS Email Test",
    parts: [ new $.net.Mail.Part({
        type: $.net.Mail.Part.TYPE_TEXT,
        text: "Atachement Test",
        contentType: "text/plain"
    })]
});
mail.parts.push(new $.net.Mail.Part({
	type: $.net.Mail.Part.TYPE_ATTACHMENT,
	data: getImage(), 
    contentType: "image/jpg",
    fileName: "myPicture.jpg"}));


var returnValue = mail.send(); 
var response = "MessageId = " + returnValue.messageId +
               ", final reply = " + returnValue.finalReply;

$.response.status = $.net.http.OK; 
$.response.contentType = "text/html";
$.response.setBody(response); 

function getImage(){
	var workspace;
	var activationMode = 0;
	var checkresult = {};
	var returncode = 200;
	var version = -1;
	var active;
	var target;

	// open db connection needed for repository sessions
	var conn = $.db.getConnection(8);
	//Create Repository Session
	var session = utilsLib.getInactiveSession(conn, workspace);

	var zip = new $.util.Zip();

	// Lookup Images
	var objects = XSDS.$defineEntity("Packages", '"_SYS_REPO"."ACTIVE_OBJECT"');
	var jsonOut = {};
	jsonOut.Objects = objects.$query().$project({OBJECT_NAME : true})
	        .$where(objects.PACKAGE_ID.$like('sap.hana.democontent.epmNext.services.zip.demo')
	        .$and(objects.OBJECT_NAME.$like('%'))).$order({	by : objects.OBJECT_NAME}).$distinct().$execute();

	
	//Read each image from the Repository and add it to the ZIP
		var object = jsonOut.Objects[0].OBJECT_NAME;
		var path = "sap/hana/democontent/epmNext/services/zip/demo/" + object + ".jpg"
		var target = objectsLib.getTarget(path, version, session, active);

		if (target) {
			return target.bdata;
		}

}