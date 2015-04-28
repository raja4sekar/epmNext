var utilsLib = $.import("sap.hana.xs.dt.base.server", "utilsLib");
var objectsLib = $.import("sap.hana.xs.dt.base.server", "objectsLib");
var XSDS = $.import("sap.hana.xs.libs.dbutils", "xsds");

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
        .$where(objects.PACKAGE_ID.$like('%sap.hana.democontent.epmNext.services.zip.demo%')
        .$and(objects.OBJECT_NAME.$like('%'))).$order({	by : objects.OBJECT_NAME}).$distinct().$execute();

//Read each image from the Repository and add it to the ZIP
for (var i = 0; i < jsonOut.Objects.length; i++) {
	var object = jsonOut.Objects[i].OBJECT_NAME;
	var path = "sap/hana.democontent/epmNext/services/zip/demo/" + object + ".jpg"
	var target = objectsLib.getTarget(path, version, session, active);

	if (target) {
		zip["images/"+ object +".jpg"] = target.bdata;
	}
}

//If the ZIP has content output it
if (zip) {
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/zip";
	$.response.headers.set('Content-Disposition',
			"attachment; filename = 'ZipExample.zip'");
	$.response.setBody(zip.asArrayBuffer());
} else {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody('Invalid Zip Content');
}