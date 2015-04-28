sap.ui.controller("ui.defaultNew", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     */
       onInit: function() {
    	    // attach handlers for validation errors
    	    sap.ui.getCore().attachValidationError(function (evt) {
    	      var control = evt.getParameter("element");
    	      if (control && control.setValueState) {
    	        control.setValueState("Error");
    	      }
    	    });
    	    sap.ui.getCore().attachValidationSuccess(function (evt) {
    	      var control = evt.getParameter("element");
    	      if (control && control.setValueState) {
    	        control.setValueState("None");
    	      }
    	    });  
    	    
            var oVizFrame = this.getView().byId("idVizFrameBar");
	    
    	    // A Dataset defines how the model data is mapped to the chart 
    	    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
    	        dimensions: [{
    	            axis: 1,    	        	
    	            name: oBundle.getText("table"),
    	            value: "{label}"
   
    	        }],

    	        // it can show multiple measures, each results in a new set of bars in a new color 
    	        measures: [
    	            // measure 1
    	            {
    	                group: 1,
     	                name: oBundle.getText("size"), // 'name' is used as label in the Legend 
    	                value: "{record_count}" // 'value' defines the binding for the displayed value   
    	            }, {
    	                group: 2,    	            	
    	                name: oBundle.getText("size2"), // 'name' is used as label in the Legend 
    	                value: "{table_size}" // 'value' defines the binding for the displayed value   
    	            }
    	        ],

    	        // 'data' is used to bind the whole data collection that is to be displayed in the chart 
    	        data: {
    	            path: "/modelData"
    	        }

    	    });
    	    oVizFrame.setDataset(oDataset);
    	    var data = sap.ui.getCore().getModel("chart").getData();
            oVizFrame.setModel(sap.ui.getCore().getModel("chart"));   
            
            oVizFrame.setTitle(new sap.viz.ui5.types.Title({
                visible: true,
                text: oBundle.getText("bartitle")
            }));
            
            oVizFrame.setPlotArea(new sap.viz.ui5.types.VerticalBar({
            	 dataLabel : {visible : true, formatString : "#,##0"},
                 isFixedDataPointSize : true
            }));
            
            oVizFrame.setYAxis(new sap.viz.ui5.types.Axis({
                label: {
                    formatString: "u"
                }
            }));
            
            oVizFrame.setToolTip(new sap.viz.ui5.types.Tooltip({
                formatString: [
                               [tooltipFormatString]
                           ] // defined in global.js
            }));
       
            
            this.getTableSizes(this);
       },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     */
    //   onBeforeRendering: function() {
    //
    //   },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     */
    //   onAfterRendering: function() {
    //
    //   },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     */
    //   onExit: function() {
    //
    //   }

   onHelpOpen: function(){
	   var view = this.getView();
       view._bDialog = sap.ui.xmlfragment(
           "ui.tileDialog", this // associate controller with the fragment
       );
       view._bDialog.addStyleClass("sapUiSizeCompact");
       view.addDependent(this._bDialog);
       view._bDialog.open();	   
 
   },
   
   onDialogCloseButton: function() {
       this.getView()._bDialog.close();
   },
   
   onExecute: function(){
	   // collect input controls
	    var view = this.getView();
	    var inputs = [
	      view.byId("POVal"),
	      view.byId("SOVal")

	    ];

	    // check that inputs are not empty
	    // this does not happen during data binding as this is only triggered by changes
	    jQuery.each(inputs, function (i, input) {
	      if (!input.getValue()) {
	        input.setValueState("Error");
	      }
	    });

	    // check states of inputs
	    var canContinue = true;
	    jQuery.each(inputs, function (i, input) {
	      if ("Error" === input.getValueState()) {
	        canContinue = false;
	        return false;
	      }
	    });

	    // output result
	    if (canContinue) {
          var oController = sap.ui.getCore().byId("defaultNew").getController();
          oController.executeCall(oController);
	    } else {
	      sap.m.MessageBox.alert(oBundle.getText("ValidNumber"));
	    }	   
   },
   
   executeCall: function(oController){
	   //changes to check if DG is being executed by a different user.This would avoid simultaneous updates    		 
       var that = this;
       var flag = 1;
       var xsrf_token;
       $.ajax({
           type: "GET",
           async: false,
           url: "/sap/hana/democontent/epmNext/admin/checkDG.xsjs",
           headers: {
               "X-CSRF-Token": "Fetch"
           },
           success: function(data, textStatus, request) {
               xsrf_token = request.getResponseHeader('X-CSRF-Token');
               if (data === "1") {
            	   sap.m.MessageBox.show(oBundle.getText("DGMessage"),{ icon: "ERROR" });
                   flag = 0;
               } else if (data === "0") {}
           }
       });

       //end of changes to check if DG is being executed by a different user.This would avoid simultaneous updates   

       if (!flag)
           return;


       var intRegex = /^\d+$/;
       var oModel = sap.ui.getCore().getModel();
       if (oModel.getProperty('cb5') === true) {
           if (parseInt(oModel.getProperty('/POVal')) !== 0 || parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oModel.setProperty('txtLog',"");
                   phase1 = 0;
                   phase2 = 0;
                   phase3 = 0;
                   phase4 = 0;
                   poLoops = 0;
                   soLoops = 0;
                   oModel.setProperty('/percentValue',0);
                   oModel.setProperty('/displayValue',"");
                   sap.m.MessageBox.show(oBundle.getText("confirm_delete"),{
                	   icon: sap.m.MessageBox.Icon.QUESTION,
                	   title: oBundle.getText("title_delete"),
                	   actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                	   onClose: function(bResult) {
                           oController.executeConfirm(bResult, oController);
                       }
                	   
                   });

           }

       } else {
           oModel.setProperty('/txtLog',"");
           phase1 = 0;
           phase2 = 0;
           phase3 = 0;
           phase4 = 0;
           poLoops = 0;
           soLoops = 0;
           oModel.setProperty('/percentValue',0);
           oModel.setProperty('/displayValue',"");
           sap.m.MessageBox.show(oBundle.getText("confirm_delete"),{
        	   icon: sap.m.MessageBox.Icon.QUESTION,
        	   title: oBundle.getText("title_delete"),
        	   actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        	   onClose: function(bResult) {
                   oController.executeConfirm(bResult, oController);
               }
        	   
           });           
       }
	   
   },
   
   executeConfirm: function(bResult, oController) {
	   if(bResult==='CANCEL'){return};
       //ajax call to fetch the xsrf token
       $.ajax({
           url: "/sap/hana/xs/dt/base/server/csrf.xsjs",
           type: 'HEAD',
           async: false,
           headers: {
               "X-CSRF-Token": "Fetch"
           },
           success: function(data, textStatus, jqXHR) {
               if (jqXHR.getResponseHeader("x-sap-login-page")) {
                   return;
               }
               var securityToken = jqXHR.getResponseHeader("X-CSRF-Token");
               frames.securityToken = securityToken;
           }
       });
       var oModel = sap.ui.getCore().getModel();
       if (bResult) {
           if (oModel.getProperty("/cb1")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=reseed&object=master';
               jQuery.ajax({
                   url: aUrl,
                   method: 'GET',
                   dataType: 'text',
                   success: function(myTxt) {
                       oController.onReseedComplete(myTxt, oController);
                       var oUrl = "/sap/hana/xs/dt/base/file/sap/hana/democontent/epmNext/data/loads/MasterData.hdbti";
                       oController.reloadData(oUrl, oController);
                       oUrl = "/sap/hana/xs/dt/base/file/sap/hana/democontent/epmNext/data/loads/Util.hdbti";
                       oController.reloadData(oUrl, oController);
                   },
                   error: function() {
                       onError(oBundle.getText("cb1"));
                   },
                   async: true
               });
           } else if (oModel.getProperty("/cb2")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=reseed&object=transactional';
               jQuery.ajax({
                   url: aUrl,
                   method: 'GET',
                   dataType: 'text',
                   success: function(myTxt) {
                       oController.onReseedComplete2(myTxt, oController);
                       var oUrl = "/sap/hana/xs/dt/base/file/sap/hana/democontent/epmNext/data/loads/Sales.hdbti";
                       oController.reloadData(oUrl, oController);
                       oUrl = "/sap/hana/xs/dt/base/file/sap/hana/democontent/epmNext/data/loads/Purchase.hdbti";
                       oController.reloadData(oUrl, oController);
                   },
                   error: function() {
                       onError(oBundle.getText("cb2"));
                   },
                   async: true
               });
           } else if (oModel.getProperty("/cb2a")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=synonym';
               jQuery.ajax({
                   url: aUrl,
                   method: 'GET',
                   dataType: 'text',
                   success: function(myTxt) {
                       oController.onSynonymComplete(myTxt, oController);
                   },
                   error: function() {
                       onError(oBundle.getText("cb2a"));
                   },
                   async: true
               });
           } else if (oModel.getProperty("/cb3")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=resetSequence&object=';
               var tableArray = ["addressSeqId",
                   "employeeSeqId", "partnerSeqId",
                   "purchaseOrderSeqId", "salesOrderId",
                   "textSeqId"
               ];
               for (var i = 0; i < tableArray.length; i++) {
                   jQuery.ajax({
                       url: aUrl + tableArray[i],
                       method: 'GET',
                       dataType: 'text',
                       success: function(myTxt) {
                           oController.onResequenceComplete(myTxt, oController, tableArray[i]);
                       },
                       error: function() {
                           onError(oBundle.getText("cb3"));
                       },
                       async: true
                   });
               }
           } else if (oModel.getProperty("/cb4")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               if (parseInt(oModel.getProperty('/POVal')) !== 0) {
                   oController.triggerReplicatePO(oController);
               }
               if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oController.triggerReplicateSO(oController);
               }
           }
           // checkbox for time based data generator
           else if (oModel.getProperty("/cb5")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               if (parseInt(oModel.getProperty('/POVal')) !== 0) {
                   oController.triggerReplicateTimeBasedPO(oController);
               }
               if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oController.triggerReplicateTimeBasedSO(oController);
               }
           }
       }
   },
   
   reloadData: function(oUrl, oController) {
       oSapBackPack = {};
       oSapBackPack.Workspace = 'SHINE_DATA';
       sapBackPack = JSON.stringify(oSapBackPack);
       $.ajax({
           url: oUrl,
           type: 'GET',
           headers: {
               "Content-Type": "text/plain;charset=UTF-8",
               "SapBackPack": sapBackPack
           },
           success: function onComplete(data) {
               frames.response = data;
               oSapBackPack.Workspace = 'SHINE_DATA';
               oSapBackPack.Activate = true;
               sapBackPack = JSON.stringify(oSapBackPack);

               $.ajax({
                   url: oUrl,
                   type: 'PUT',
                   data: frames.response,
                   headers: {
                       "Content-Type": "text/plain;charset=UTF-8",
                       "SapBackPack": sapBackPack,
                       "X-CSRF-Token": frames.securityToken
                   },
                   success: function onComplete(data) {
                       oController.getTableSizes();
                   },
                   error: function() {
                       onError(oBundle.getText("put_request"));
                   }
               });
           },
           error: function() {
               onError(oBundle.getText("get_request"));
           }
       });
   },
   
   updateReplicateProgress: function() {
       var oModel = sap.ui.getCore().getModel();
       var totalPO = parseInt(oModel.getProperty('/POVal'), 10);
       var totalSO = parseInt(oModel.getProperty('/SOVal'), 10);
       oModel.setProperty('/percentValue',Math.round((poLoops + soLoops) / (totalPO + totalSO) * 100));
       oModel.setProperty('/displayValue',oBundle.getText("generatedPG", [
           numericSimpleFormatter((poLoops + soLoops) * 1000),
           numericSimpleFormatter((totalPO + totalSO) * 1000)
       ]));
   },
  
   updateReplicateTimeBasedProgress: function() {
	   var oModel = sap.ui.getCore().getModel();	   
	   oModel.setProperty('/percentValue',100);
	   oModel.setProperty('/displayValue',oBundle.getText("generatedTimeBased", [
           numericSimpleFormatter((poLoops + soLoops) * 1000)
       ]));
   },
   
   triggerReplicatePO: function(oController) {
       poLoops++;
       oController.updateReplicateProgress();
       var aUrl = 'DataGen.xsjs?cmd=replicatePO&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onPOComplete(myTxt, oController);
           },
           error: function() {
               onError(oBundle.getText("purchase_order"));
           },
           async: true
       });
   },
   triggerReplicateSO: function(oController) {
       soLoops++;
       oController.updateReplicateProgress();
       var aUrl = 'DataGen.xsjs?cmd=replicateSO&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onSOComplete(myTxt, oController);
           },
           error: function() {
               onError(oBundle.getText("sales_order"));
           },
           async: true
       });
   },
   // For time based data generation
   //Jan%204,%202015
   triggerReplicateTimeBasedPO: function(oController) {
	   var oModel = sap.ui.getCore().getModel();
       poLoops = parseInt(oModel.getProperty('POVal'), 10);
       var aUrl = 'DataGen.xsjs?cmd=replicateTimeBasedPO&startdate=' + oModel.getProperty('/startDate').toDateString() + '&enddate=' + oModel.getProperty("/endDate").toDateString() + '&noRec=' + oModel.getProperty('/POVal') + '&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onTimeBasedPOComplete(myTxt, oController);
           },
           error: function() {
               onError(oBundle.getText("purchase_order"));
           },
           async: true
       });
   }, 
   triggerReplicateTimeBasedSO: function(oController) {
	   var oModel = sap.ui.getCore().getModel();
       soLoops = parseInt(oModel.getProperty('SOVal'), 10);
       var aUrl = 'DataGen.xsjs?cmd=replicateTimeBasedSO&startdate=' + oModel.getProperty('/startDate').toDateString() + '&enddate=' + oModel.getProperty("/endDate").toDateString() + '&noRec=' + oModel.getProperty('/SOVal') + '&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onTimeBasedSOComplete(myTxt, oController);
           },
           error: function() {
               onError(oBundle.getText("sales_order"));
           },
           async: true
       });
   },  

   toggleGenerate: function(selected, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty("/POVal",0);
       oModel.setProperty("/SOVal",0);
       oModel.setProperty("/listVisible",selected);

   },   
   
   toggleDateGenerateFalse: function(){
	   var oController = sap.ui.getCore().byId("defaultNew").getController();
	   oController.toggleDateGenerate(false,oController);
   },
   toggleDateGenerateExt: function(){
	   var oController = sap.ui.getCore().byId("defaultNew").getController();
	   oController.toggleDateGenerate(false,oController);
	   oController.toggleGenerate(true,oController);	   
   },   
   toggleDateGenerateExt2: function(){
	   var oController = sap.ui.getCore().byId("defaultNew").getController();
	   oController.toggleGenerate(false,oController);
	   oController.toggleDateGenerate(true,oController);	   
   },   
   // For time based data generation
   toggleDateGenerate: function(selected, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty("/listVisible",selected);
       oModel.setProperty("/listDateVisible",selected);        
       if (selected) {
    	   var now = new Date();
           var startDate = new Date();
           startDate.setMonth(now.getMonth()-1);
           var todayDate = new Date(); 
           oModel.setProperty("/startDate",startDate);
           oModel.setProperty("/endDate",todayDate);   
       }
   },
   
   onReseedComplete: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));
       phase1 = 7;
       oModel.setProperty('/percentValue', Math.round(phase1 / 7 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase1.toString(), 7]));
   },
   

   onReseedComplete2: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));      
       phase2 = 4;
       oModel.setProperty('/percentValue', Math.round(phase2 / 4 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase2.toString(), 4]));
       oController.getTableSizes();
   },

   onSynonymComplete: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog')); 
       oModel.setProperty('/percentValue',100);
       oModel.setProperty('/displayValue','100%');

   },
   onResequenceComplete: function(myTxt, oController, oObject) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));
       phase3++;
       oModel.setProperty('/percentValue', Math.round(phase3 / 6 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase3.toString(), 6]));
       oController.getTableSizes();
   },

   onPOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {
           if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {

               oController.getTableSizes();
           }
       } else {
           oController.triggerReplicatePO(oController);
       }
   },
   onTimeBasedPOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       oController.updateReplicateTimeBasedProgress();

       if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {
           if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {

               oController.getTableSizes();
           }
       } else {
           oController.triggerReplicateTimeBasedPO(oController);
       }
   },
   onTimeBasedSOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       oController.updateReplicateTimeBasedProgress();

       if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {
           if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {

               oController.getTableSizes();
           }
       } else {
           oController.triggerReplicateTimeBasedSO(oController);
       }
   },
   onSOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       oController.getTableSizes();
       if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {
           if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {

           }
       } else {
           oController.triggerReplicateSO(oController);
       }
   },
   getUniqueTime: function() {
       var time = new Date().getTime();
       while (time == new Date().getTime())
       ;
       return new Date().getTime();
   },
   
   handleDateChange: function(evt){
	// collect input controls
	   var from = evt.getParameter('from');
	   var to = evt.getParameter('to');
	   var valid = evt.getParameter('valid');
	   var view = this.getView();
	   var input =	evt.oSource; 
	   var canContinue = true;	   
	   if (!valid ){
		   input.setValueState("Error");
	        canContinue = false;		   
	   }else{
		   input.setValueState("None");
	        canContinue = true;		   
	   }
	    // output result
	    if (canContinue) {
	    } else {
	      sap.m.MessageBox.alert(oBundle.getText("ValidDate1"));
	    }	   	    
   },
   
   
   getTableSizes: function(oController) {
       var aUrl = 'DataGen.xsjs?cmd=getSize';

       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'json',
           success: onLoadSizes,
           error: function() {
               onError(oBundle.getText("table_size"));
           }
       });
   },

   

});

function onLoadSizes(myJSON) {

    var data = [];
    for (var i = 0; i < myJSON.entries.length; i++) {
        data[i] = {
            label: myJSON.entries[i].name,
            table_size: myJSON.entries[i].table_size,
            record_count: myJSON.entries[i].record_count
        };
    }
    
    var oBarModel = sap.ui.getCore().getModel("chart");
    oBarModel.setData({
        modelData: data
    });
}

