var zip = new $.util.Zip();
zip["folder1/demo1.txt"] = "This is the new ZIP Processing in XSJS";
zip["demo2.txt"] = "This is also the new ZIP Processing in XSJS";

$.response.status = $.net.http.OK;
$.response.contentType = "application/zip";
$.response.headers.set('Content-Disposition', "attachment; filename = 'ZipExample.zip'");
$.response.setBody(zip.asArrayBuffer());