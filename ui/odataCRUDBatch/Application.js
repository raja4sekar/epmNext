jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.app.Application.extend("Application", {

	init : function () {
	      var oModel = new sap.ui.model.odata.ODataModel(
	          "/sap/hana/democontent/epmNext/services/userBeforeExit.xsodata/", true);
  		  oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
  		  oModel.attachRejectChange(this,function(oEvent){
  		    sap.m.MessageBox.alert("You are already editing another Entry! Please submit or reject your pending changes!");
		  });	          
          sap.ui.getCore().setModel(oModel, "userModel");   
	},
	
	main : function () {
	    

		// create app view and put to html root element
		var root = this.getRoot();
		var page = new sap.m.Page({
		    title: "OData CRUD Batch Exercise",
		    content: new sap.ui.xmlview("app", "view.App")
		});        
		var app = new sap.m.App();
		app.addPage(page);
		app.placeAt(root);
	}
});          