jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.app.Application.extend("Application", {

	init : function () {
	},
	
	main : function () {
	    

		// create app view and put to html root element
		var root = this.getRoot();
		var page = new sap.m.Page({
		    title: "XSJS Multiply Exercise",
		    content: new sap.ui.xmlview("app", "view.App")
		});        
		var app = new sap.m.App();
		app.addPage(page);
		app.placeAt(root);
	}
});