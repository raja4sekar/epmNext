sap.ui.jsview("ui.App", { 

        getControllerName: function() {
            return "ui.App"; 
        },

        createContent: function(oController) {
        	// make everything inside this View appear in Compact mode
	        this.addStyleClass("sapUiSizeCompact"); 

	        // to avoid scrollbars on desktop the root view must be set to block display
			this.setDisplayBlock(true);			
			
			var appIcon = "/sap/hana/democontent/epmNext/ui/images/sap_18.png";
			var appTitle =  "Data Generator";
           
            
			return new sap.ui.unified.Shell({
				icon: appIcon,
				content: new sap.ui.xmlview("defaultNew", "ui.defaultNew"),
                user: new sap.ui.unified.ShellHeadUserItem({
                	image:"sap-icon://person-placeholder",
                	username:"{config>/UserName}"
                }),
                headEndItems: 
                    new sap.ui.unified.ShellHeadItem({
                    	icon:"sap-icon://log",
                    	tooltip:"Logoff",
                    	press: oController.logout
                    })
                
			});
		}
});