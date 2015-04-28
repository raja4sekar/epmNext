//To use a javascript controller its name must end with .controller.js
sap.ui.controller("view.App", {
	 onInit: function(){
		 var view = this.getView();
		 var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epmNext/services/businessPartners.xsodata/", true);
		 view.setModel(oModel); 
	 }
});