jQuery.sap.declare("sap.shine.esh.Component");


sap.ui.core.UIComponent.extend("sap.shine.esh.Component", {

	createContent: function() {

		var settings = {
				ID: "productsearch",
				title: "Products Search in SHINE",
				description: "SHINE service for OData search",
				url: "/sap/hana/democontent/epmNext/ui5search/services/productTexts.xsodata",
				schema: "sap.hana.democontent.epmNext",
				entitySet: "PRODUCTS_TEXT"
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "sap.shine.esh.view.servicePage",
			type: "JS",
			viewData: settings
		});
		
		return oView;
	}
});
