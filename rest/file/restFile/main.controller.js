sap.ui.controller("restFile.main", {

		escapeHtml: function(string) {
			var entityMap = {
					"&" : "&amp;",
					"<" : "&lt;",
					">" : "&gt;",
					'"' : '&quot;',
					"'" : '&#39;',
					"/" : '&#x2F;'
				};
			
			return String(string).replace(/[&<>"'\/]/g, function(s) {
				return entityMap[s];
			});
		},

     // Display chosen file
	 onRepoDisplay: function(){
		 	var oController = sap.ui.getCore().byId("idRestFile").getController();
		 	var ShortUrl = '/sap/hana/xs/dt/base/file/';
		 	var package = sap.ui.getCore().byId("Package").getValue();
			var lPath = package.replace(/[.]/g, '/');
			var Url = ShortUrl + lPath;
			Url = Url + '/'
			+ sap.ui.getCore().byId("Object").getValue()
			+ '.'
			+ sap.ui.getCore().byId("Extension").getValue();	 
			
            var oSapBackPack = new Object();
            oSapBackPack.Workspace='__empty__';
            var sapBackPack = JSON.stringify(oSapBackPack);
            
			jQuery.ajax({
				url : Url,
				method : 'GET',
				headers : {
                    "SapBackPack" : sapBackPack,
                },				
				success : oController.onInsertContent,
				error : oController.onErrorCall	});				
	 },
	 onInsertContent: function(myTXT) {
			var oController = sap.ui.getCore().byId("idRestFile").getController();
			var html = new sap.ui.core.HTML({
				// static content
				content : '<div id="content1" class="wiki"><div class="code"><pre>'
						+ oController.escapeHtml(myTXT) + '\n' + '</pre></div></div>',
				preferDOM : false
			});
			sap.ui.getCore().byId("PanelContent").removeAllContent();
			sap.ui.getCore().byId("PanelContent").addContent(html);
		},
	 
	 //Package Filter
	 loadPackageFilter: function(oEvent){
		   var oController = sap.ui.getCore().byId("idRestFile").getController();
		   gSearchParam = oEvent.getParameter("suggestValue");
		   var aUrl = '/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getPackages&package='+escape(gSearchParam);
		    jQuery.ajax({
		       url: aUrl,
		       method: 'GET',
		       dataType: 'json',
		       success: oController.onLoadPackageFilter,
		       error: oController.onErrorCall });
		  
	 },	 
	 onLoadPackageFilter: function(myJSON){
		  var oSearchControl = sap.ui.getCore().byId("Package");
		  oSearchControl.destroyItems();
		  for( var i = 0; i<myJSON.length; i++)
		     {
			  oSearchControl.addItem(new sap.ui.core.ListItem({text: myJSON[i].PACKAGE_ID}));

		     }
		},
	 
		//Object Filter
		 loadObjectFilter: function(oEvent){
			   var oController = sap.ui.getCore().byId("idRestFile").getController();
			   gSearchParam = oEvent.getParameter("suggestValue");
			   if(typeof(gSearchParam) != 'undefined'){
				   if(gSearchParam == "*"){gSearchParam="";}
			   }
			   else{ gSearchParam = "";}
			   packageName = sap.ui.getCore().byId("Package").getValue();
			    var aUrl = '/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getObjList&package='+escape(packageName)+'&obj='+gSearchParam;
			    jQuery.ajax({
			       url: aUrl,
			       method: 'GET',
			       dataType: 'json',
			       success: oController.onLoadObjFilter,
			       error: oController.onErrorCall });
		 },		 
		 onLoadObjFilter: function(myJSON){
			  var oSearchControl = sap.ui.getCore().byId("Object");
			  oSearchControl.destroyItems();
			  for( var i = 0; i<myJSON.length; i++)
			     {
				  oSearchControl.addItem(new sap.ui.core.ListItem({text: myJSON[i].OBJECT_NAME}))

			     }
			},
          
		 //Extension Filter
			loadExtFilter: function(oEvent){
				   var oController = sap.ui.getCore().byId("idRestFile").getController();				 
				   gSearchParam = sap.ui.getCore().byId("Object").getValue();
				   
				   if(typeof(gSearchParam) != 'undefined'){
					   if(gSearchParam == "*"){gSearchParam="";}
				   }
				   else{ gSearchParam = "";}
				   packageName = sap.ui.getCore().byId("Package").getValue();
				    var aUrl = '/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getExtList&package='+escape(packageName)+'&obj='+gSearchParam;
				    jQuery.ajax({
				       url: aUrl,
				       method: 'GET',
				       dataType: 'json',
				       success: oController.onLoadExtFilter,
				       error: oController.onErrorCall });
			 },			 
			 onLoadExtFilter: function(myJSON){
				  var oSearchControl = sap.ui.getCore().byId("Extension");
				  oSearchControl.destroyItems();
				  for( var i = 0; i<myJSON.length; i++)
				     {
					  oSearchControl.addItem(new sap.ui.core.ListItem({text: myJSON[i].OBJECT_SUFFIX}))

				     }
				},
	
   //Error Handler				
   onErrorCall: function(jqXHR, textStatus, errorThrown){
 	  if(jqXHR.status == '500'){
	    		 sap.ui.commons.MessageBox.show(jqXHR.responseText, 
	    				 "ERROR",
	    				 "Service Call Error" );	
	    		return;	
 	  }
 	  else{
		         sap.ui.commons.MessageBox.show(jqXHR.statusText, 
	    				 "ERROR",
	    				 "Service Call Error" );	
	    		return;	
 	  }
 	}
				
});