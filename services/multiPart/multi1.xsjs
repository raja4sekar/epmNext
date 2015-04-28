// Handling of multipart requests and responses in xsjs files:
var i;
var n = $.request.entities.length;
var client = new $.net.http.Client();
for (i = 0; i < n; ++i) {
   var childRequest = $.request.entities[i].body.asWebRequest();
   client.request(childRequest, childRequest.headers.get("Host") + childRequest.path);
   var childResponse = client.getResponse();
   var responseEntity =  $.response.entities.create();
   responseEntity.setBody(childResponse);
}