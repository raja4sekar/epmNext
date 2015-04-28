sap.ui.jsview("restFile.main", {

      getControllerName : function() {
         return "restFile.main";
      },

      createContent : function(oController) {
    	  var overallLayout = new sap.ui.commons.layout.MatrixLayout({width:"100%"});
    	  
    	  var Panel = new sap.ui.commons.Panel().setText("REST API - File API");
    	  var layout = new sap.ui.commons.layout.MatrixLayout({
    			id : 'layout1',
    			layoutFixed : true,
    			width : '450px',
    			columns : 2,
    			widths : ['150px', '300px', ] });
	      Panel.addContent(layout);
	      
    	  //Filter By Package
	      var oPackage = new sap.ui.commons.AutoComplete("Package", {
	        maxPopupItems: 10,
	        tooltip: "Package",
	        width: "300px",
	        suggest: oController.loadPackageFilter });
	      layout.createRow(new sap.ui.commons.Label({text: "Repository Package: "}), oPackage);

	      //Filter By Object
	      var oObject = new sap.ui.commons.AutoComplete("Object", {
	        maxPopupItems: 10,
	        tooltip: "Object",
	        width: "300px",
	        suggest: oController.loadObjectFilter });
	        oObject.setFilterFunction(
	    		  function(sValue, oItem){
	    			  if(sValue == "*"){
	    				  return true;
	    			  }
	    			  else{
	    				  return jQuery.sap.startsWithIgnoreCase(oItem.getText(), sValue); }
	    		  	  }
	    		  );    	  
	      layout.createRow(new sap.ui.commons.Label({text: "Object: "}), oObject);
	      
	    //Filter By Extensions
	      var oExtension = new sap.ui.commons.AutoComplete("Extension", {
	        maxPopupItems: 10,
	        tooltip: "Extension",
	        width: "100px",
	        suggest: oController.loadExtFilter });
	        oExtension.setFilterFunction(
	    		  function(sValue, oItem){
	    			  if(sValue == "*"){
	    				  return true;
	    			  }
	    			  else{
	    				  return jQuery.sap.startsWithIgnoreCase(oItem.getText(), sValue); }
	    		  	  }
	    		  );
	      layout.createRow(new sap.ui.commons.Label({text: "Extension: "}), oExtension);

	      var oDisplayButton = new sap.ui.commons.Button({
	          text : "Display",
	          press : oController.onRepoDisplay });  
	      layout.createRow(oDisplayButton);
	      
	      var PanelContent = new sap.ui.commons.Panel("PanelContent").setText("Repository Object Details");
	      
	      overallLayout.createRow(Panel);
	      overallLayout.createRow(PanelContent);
	      return overallLayout;
      }

});