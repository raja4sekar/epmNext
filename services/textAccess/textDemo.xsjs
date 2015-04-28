var textAccess = $.import("sap.hana.xs.i18n","text");
var bundle = textAccess.loadBundle("sap.hana.democontent.epmNext.services.textAccess","demo1");
var singleText = bundle.getText("demo");
var replaceText = bundle.getText("demo2",['1001']);
var oAllTexts = bundle.getTexts();

//$.response.setBody(singleText);
$.response.setBody(replaceText);
//$.response.setBody(JSON.stringify(oAllTexts));
