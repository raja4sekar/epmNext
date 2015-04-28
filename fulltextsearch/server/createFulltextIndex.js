// create fulltext index - No Longer Needed in SPS09
define([], function($) {
    "use strict";
    var xsrf_token;
    var xmlHttp1 = null;
    var xmlHttp = null;
    try {
        // Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        try {
            // MS Internet Explorer (ab v6)
            xmlHttp1 = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            try {
                // MS Internet Explorer (ab v5)
                xmlHttp1 = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xmlHttp1 = null;
            }
        }
    }
    if (xmlHttp1) {
        xmlHttp1.open('GET', '/sap/hana/democontent/epmNext/services/soCreate.xsodata', false);
        xmlHttp1.setRequestHeader("Content-Type", "application/json");
        xmlHttp1.setRequestHeader("x-csrf-token", "Fetch");
        xmlHttp1.onreadystatechange = function() {
            if (xmlHttp1.readyState == 4) {
                xsrf_token = xmlHttp1.getResponseHeader("x-csrf-token");
                // alert(xmlHttp.responseText);
            }
        };
        xmlHttp1.send(null);
    }

    try {
        // Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        try {
            // MS Internet Explorer (ab v6)
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            try {
                // MS Internet Explorer (ab v5)
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xmlHttp = null;
            }
        }
    }
    if (xmlHttp) {
        xmlHttp.open('POST', '/sap/hana/democontent/epmNext/fulltextsearch/server/createFulltextIndex.xsjs', false);
        xmlHttp.setRequestHeader("x-csrf-token", xsrf_token);
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4) {
                window.console.log(xmlHttp.statusText);
                // alert(xmlHttp.responseText);
            }
        };
        xmlHttp.send(null);
    }
});