	/*************** Language Resource Loader *************/
    jQuery.sap.require("jquery.sap.resources");
    var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
    var oBundle = jQuery.sap.resources({url : "./ui/i18n/messagebundle.hdbtextbundle", locale: sLocale});
    var oBarModel = new sap.ui.model.json.JSONModel();
    var phase1 = 0;
    var phase2 = 0;
    var phase3 = 0;
    var phase4 = 0;
    var poLoops = 0;
    var soLoops = 0;
    var oInt = new sap.ui.model.type.Integer({
        minIntegerDigits: 1

    });    

    /** Tooltip formatting for the chart */
    var tooltipFormatString = '';
    if (sLocale.indexOf("de") > -1) {
        tooltipFormatString = '#.###.###.###,00'; 
    } else {
        tooltipFormatString = '#,###,###,###.00'; 
    }
    
	/*************** Hijacking for Gold Reflection *************/
	if (sap.ui.getCore().getConfiguration().getTheme() == "sap_goldreflection" || "sap_bluecrystal") { // this line is a hack, the rest of this coding is what a BusyIndicator hijacker could do
		sap.ui.core.BusyIndicator.attachOpen(function(oEvent) {
			$Busy = oEvent.getParameter("$Busy");
			iBusyPageWidth = jQuery(document.body).width();
			$Busy.css("top", "0").css("width", iBusyPageWidth + "px");
			bBusyAnimate = true;
			iBusyLeft = $Busy[0].offsetLeft;
			window.setTimeout(animationStep, iBusyTimeStep);
		});
		sap.ui.core.BusyIndicator.attachClose(function(oEvent) {
			bBusyAnimate = false;
		});
	}

	var bBusyAnimate = false;
	var iBusyLeft = 0;
	var iBusyDelta = 60;
	var iBusyTimeStep = 50;
	var iBusyWidth = 500;
	var iBusyPageWidth;
	var $Busy;

	
function animationStep() {
		if (bBusyAnimate) {
			iBusyLeft += iBusyDelta;
			if (iBusyLeft > iBusyPageWidth) {
				iBusyLeft = -iBusyWidth;
			}
			$Busy.css("background-position", iBusyLeft + "px 0px");
			window.setTimeout(animationStep, iBusyTimeStep);
		}
	}
	/*************** END of Hijacking for Gold Reflection *************/

	/*** Numeric Formatter for Quantities ***/
	function numericSimpleFormatter(val){
        if(val===undefined){ return '0';}
        else{
        jQuery.sap.require("sap.ui.core.format.NumberFormat");
        var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
        maxFractionDigits: 0,
        minFractionDigits: 0,
        groupingEnabled: true });
        return oNumberFormat.format(val); }
    }
	
	function onError(para) {
		sap.m.MessageBox.show(para + " " + oBundle.getText("error_action"));
	    return;
	}
	
		function onErrorCall(jqXHR, textStatus, errorThrown){
			//	var page = sap.ui.getCore().byId("pageID");
			//	page.setBusy(false);					
            if(typeof jqXHR.status == 'undefined'){
           	var errorRes = JSON.parse(jqXHR.response.body);	   	   	 			 
	   	   	 	   sap.m.MessageBox.show(errorRes.error.innererror.errordetail.DETAIL, 
   	   	 				    { icon: sap.m.MessageBox.Icon.ERROR, 
   	   	 			          title: "Service Call Error",
   	   	 			          actions: [sap.m.MessageBox.Action.OK],
   	   	 			          styleClass: "sapUiSizeCompact" } );	   	            	 
            }else{
	   	 	 if(jqXHR.status === 500 || jqXHR.status === 400){

	   	 		 sap.m.MessageBox.show(jqXHR.responseText, 
	   	 				    { icon: sap.m.MessageBox.Icon.ERROR, 
	   	 			          title: "Service Call Error",
	   	 			          actions: [sap.m.MessageBox.Action.OK],
	   	 			          styleClass: "sapUiSizeCompact" } );
		    		return;	
	   	 	 }
	   	  	 else{
	   	  		 sap.m.MessageBox.show(jqXHR.statusText, 
   	   	 			{ icon: sap.m.MessageBox.Icon.ERROR, 
 	 			          title: "Service Call Error",
 	 			          actions: [sap.m.MessageBox.Action.OK],
 	 			          styleClass: "sapUiSizeCompact" } );		
		    		return;	
	   	 	 }
	   		}}
			
	
	