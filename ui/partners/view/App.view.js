sap.ui.jsview("sap.shineNext.partners.view.App", {

	getControllerName: function () {
		return "sap.shineNext.partners.view.App";
	},

	createContent : function (oController) {
		
		// to avoid scrollbars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		
		this.app = new sap.m.App({
			homeIcon : {
				'favicon' : '/sap/hana/democontent/epmNext/ui/images/faviconBP.ico',
				'precomposed': false
			}
		});
		
		this.app.addPage(new sap.ui.jsview("Home", "sap.shineNext.partners.view.Home"));
		
		return this.app;
	}
});