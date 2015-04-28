jQuery.sap.require("sap.shine.esh.util.Helper");

sap.ui.jsfragment("fragment.infoPopover", {
	createContent: function(oController) {

		var settings = oController.getView().getViewData();

		//creation of popover
		var infoPopover = new sap.m.Popover({
			title: "Information",
			placement: sap.m.PlacementType.Bottom,
			enableScrolling: false
		});

		//add the information to the popover via info-parameter
		infoPopover.addContent(
			new sap.ui.layout.form.SimpleForm({
				maxContainerCols: 1,
				content: [
					new sap.m.Label({
						text: "Service URL",
						design: "Bold",
						visible: true
					}),
					new sap.m.Text({
						text: settings.url
					}),
					new sap.m.Label({
						text: "Selected Schema",
						design: "Bold",
						visible: true
					}),
					new sap.m.Text({
						text: settings.schema
					}),
					new sap.m.Label({
						text: "Selected Entityset",
						design: "Bold",
						visible: true
					}),
					new sap.m.Text({
						text: settings.entitySet
					}),
					new sap.m.Label({
						text: "Description",
						design: "Bold",
						visible: true
					}),
					new sap.m.Text({
						align: "justify",
						text: settings.description
					})
				]
			})
		);

		return infoPopover;
	}
});
