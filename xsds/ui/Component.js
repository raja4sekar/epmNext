jQuery.sap.declare("sap.shineNext.xsjs.Component");
sap.ui.localResources("util");

sap.ui.core.UIComponent.extend("sap.shineNext.xsds.Component", {
	init: function(){
		jQuery.sap.require("util.Utility");
		jQuery.sap.require("util.Formatter");
		jQuery.sap.require("util.Connectivity");
		jQuery.sap.require("util.BusyDialogHandler");	
		
		//Call the method that created the model - login dialog will popup as no credantial where given 
		createModel(); 
	          
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},
	
	createContent: function() {
     
		var settings = {
				ID: "xsds",
				title: "Sales Dasboard XSDS",
				description: "SHINE Sales Dasboard XSDS",
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "sap.shineNext.xsds.app.App",
			type: "JS",
			viewData: settings
		});
		
		 oView.setModel(sap.ui.getCore().getModel("userModel"), "userModel");  
		return oView;
	}
});