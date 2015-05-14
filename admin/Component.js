jQuery.sap.declare("sap.shineNext.xsjs.Component");
sap.ui.localResources("util");

sap.ui.core.UIComponent.extend("sap.shineNext.admin.Component", {
	init: function(){
		jQuery.sap.require("sap.m.MessageBox");
		jQuery.sap.require("sap.m.MessageToast");
		
	      var oConfig = new sap.ui.model.json.JSONModel({});
          sap.ui.getCore().setModel(oConfig, "config"); 
          this.getSessionInfo();
          this.mainModelInit();               
  		// set i18n model
  		var i18nModel = new sap.ui.model.resource.ResourceModel({
  			bundleUrl : "ui/i18n/messagebundle.hdbtextbundle"
  		});
  		sap.ui.getCore().setModel(i18nModel, "i18n");     
  		
  		//Chart model
  		
  		data = [{
  	        label: oBundle.getText("empty"),
  	        record_count: 10,
  	        table_size: 100
  	    }];
  		var chartModel = new sap.ui.model.json.JSONModel({modelData: data});
  		sap.ui.getCore().setModel(chartModel, "chart"); 
	          
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},
	
	createContent: function() {
     
		var settings = {
				ID: "admin",
				title: "Data Generator",
				description: "SHINE Data Generator",
			};
		
		var oView = sap.ui.view({
			id: "app",
			viewName: "ui.App",
			type: "JS",
			viewData: settings
		});
		
		 oView.setModel(sap.ui.getCore().getModel("config"), "config"); 
		 oView.setModel(sap.ui.getCore().getModel("i18n"), "i18n"); 
		 oView.setModel(sap.ui.getCore().getModel("chart"), "chart");		 
		 oView.setModel(sap.ui.getCore().getModel()); 		 
		return oView;
	},
	
	getSessionInfo: function(){
		var aUrl = '/sap/hana/democontent/epmNext/admin/DataGen.xsjs?cmd=getSessionInfo';
	    this.onLoadSession(
	    		JSON.parse(jQuery.ajax({
	    		       url: aUrl,
	    		       method: 'GET',
	    		       dataType: 'json',
	    		       async: false}).responseText));
   
	},
	
	onLoadSession: function(myJSON){
		for( var i = 0; i<myJSON.session.length; i++)
	     {
		   var config =  sap.ui.getCore().getModel("config");
		   config.setProperty("/UserName",myJSON.session[i].UserName);
	     }
	},
	mainModelInit: function(){
		var model = new sap.ui.model.json.JSONModel({});
        model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);		
        sap.ui.getCore().setModel(model);          
        model.setProperty("/POVal",0);
        model.setProperty("/SOVal",0);          
        model.setProperty("/times"," * " + numericSimpleFormatter(1000));
        model.setProperty("/listVisible",false);
        model.setProperty("/listDateVisible",false); 
        model.setProperty("/displayValue"," ");    
        model.setProperty("/percentValue",0);        

        //  For New DG
    	var now = new Date();
        var startDate = new Date();
        startDate.setMonth(now.getMonth()-1);
        var todayDate = new Date(); 
        model.setProperty("/startDate",startDate);
        model.setProperty("/endDate",todayDate);        
	}	
});