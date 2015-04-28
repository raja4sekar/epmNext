jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");

sap.ui.app.Application.extend("Application", {
	
	init : function() {
		
		// set global models
		var model = new sap.ui.model.odata.ODataModel('/sap/hana/democontent/epmNext/services/businessPartners2.xsodata', true);
		sap.ui.getCore().setModel(model);
	},
	
	main : function() {
		
		// create app view and put to html root element
		var root = this.getRoot();
		sap.ui.jsview("app", "view.App").placeAt(root);
	}
});