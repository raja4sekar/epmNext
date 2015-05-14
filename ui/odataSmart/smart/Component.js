jQuery.sap.declare("sap.shineNext.odataSmart.smart.Component");

sap.ui.core.UIComponent.extend("sap.shineNext.odataSmart.smart.Component", {

	metadata: {
		rootView: "view.App",
		dependencies: {
			libs: [ "sap.m", "sap.ui.comp" ]
		},
		config: {
			sample: {
				stretch: true,
				files: [ "App.view.xml", "App.controller.js" ]
			}
		}
	}
});