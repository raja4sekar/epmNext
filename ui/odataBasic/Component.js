jQuery.sap.declare("sap.shineNext.odataBasic.Component");


sap.ui.core.UIComponent.extend("sap.shineNext.odataBasic.Component", {
	
	createContent: function() {
		var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epmNext/services/businessPartners.xsodata/", true);
      
		var settings = {
				ID: "odataBasic",
				title: "OData Basic Exercise",
				description: "SHINE service for OData Basic Exercise",
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "sap.shineNext.odataBasic.view.App",
			type: "JS",
			viewData: settings
		});
		
		 oView.setModel(oModel, "bpModel");  
		return oView;
	}
});
