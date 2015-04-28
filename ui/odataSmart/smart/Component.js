jQuery.sap.declare("smart.Component");

sap.ui.core.UIComponent.extend("smart.Component", {

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