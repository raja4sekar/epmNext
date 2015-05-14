jQuery.sap.declare("sap.shineNext.odataCRUDBatch.Component");


sap.ui.core.UIComponent.extend("sap.shineNext.odataCRUDBatch.Component", {
	init: function(){
		jQuery.sap.require("sap.m.MessageBox");
		jQuery.sap.require("sap.m.MessageToast");		
		
	    var oModel = new sap.ui.model.odata.ODataModel(
		          "/sap/hana/democontent/epmNext/services/userBeforeExit.xsodata/", true);
	  	    oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
	  		oModel.attachRejectChange(this,function(oEvent){
	  		    sap.m.MessageBox.alert("You are already editing another Entry! Please submit or reject your pending changes!");
			});
	  		
	    sap.ui.getCore().setModel(oModel, "userModel");  
	          
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},
	
	createContent: function() {
     
		var settings = {
				ID: "odataCRUDBatch",
				title: "OData CRUD Batch Exercise",
				description: "SHINE OData CRUD Batch Exercise",
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "sap.shineNext.odataCRUDBatch.view.App",
			type: "XML",
			viewData: settings
		});
		
		 oView.setModel(sap.ui.getCore().getModel("userModel"), "userModel");  
		return oView;
	}
});