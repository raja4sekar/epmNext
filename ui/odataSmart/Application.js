jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");

sap.ui.app.Application.extend("Application", {

	init : function () {
	  
	},
	
	main : function () {
	    

		// create app view and put to html root element
		var root = this.getRoot();
/*		var page = new sap.m.Page({
		    title: "OData SmartTable Exercise",
		    content: new sap.ui.xmlview("app", "view.App")
		});        
		var app = new sap.m.App("App");
		app.addPage(page);
		app.placeAt(root);*/
		
		
		
		
		// Create a component
		 sap.ui.localResources("smart");
		 jQuery.sap.registerModulePath('smart', 'smart');
	       var oComp1 = sap.ui.getCore().createComponent({
	        name: "smart",
	        id: "Comp1"
	    });
	        // Create a Ui container 
	    var oCompCont1 = new sap.ui.core.ComponentContainer("CompCont1", {
	        component: oComp1
	    });
	        // place this Ui Container with the Component inside into UI Area 
	    oCompCont1.placeAt(root);
	}
});          