jQuery.sap.declare("sap.shineNext.odataCRUD.Component");


sap.ui.core.UIComponent.extend("sap.shineNext.odataCRUD.Component", {
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
				ID: "odataCRUD",
				title: "OData CRUD Exercise",
				description: "SHINE OData CRUD Exercise",
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "sap.shineNext.odataCRUD.view.App",
			type: "XML",
			viewData: settings
		});
		
		 oView.setModel(sap.ui.getCore().getModel("userModel"), "userModel");  
		return oView;
	}
});