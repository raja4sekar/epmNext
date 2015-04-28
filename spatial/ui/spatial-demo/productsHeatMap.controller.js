//To use a javascript controller its name must end with .controller.js
sap.ui.controller("spatial-demo.productsHeatMap", {

    onInit: function() {
        
    },
    
    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf shine_so.main
     */
    onAfterRendering: function() {
        var view = this.getView();
        var controller = this;
        
        var oModel = new sap.ui.model.odata.ODataModel('/sap/hana/democontent/epmNext/spatial/services/productSales.xsodata', true);
        
        this.getView().setModel(oModel);
        
        oModel.attachRequestCompleted(function (oEvent) {
            
        });
        
        view.selector.bindItems({
            path:'/ProductDetails',
            parameters: {
                select: 'PRODUCTID,PRODUCT_NAME'
            },
            template: new sap.ui.core.Item({
                key: "{PRODUCTID}",
                text: "{PRODUCT_NAME}"
            }),
            sorter: new sap.ui.model.Sorter("PRODUCT_NAME")
        });
        
        view.selector.onAfterRendering = function(oEvent) {
            controller.loadDataForProduct('HT-2001', view);
        };
        
        // Get the DOM node to which we will append the map
        var mapContainer = document.getElementById("heatMapSplitter_firstPane");

        // We create a new instance of InfoBubbles bound to a variable so we can call it later on
        var infoBubbles = new nokia.maps.map.component.InfoBubbles();

        // Create a map inside the map container DOM node
        var map = new nokia.maps.map.Display(mapContainer, {
            // initial center and zoom level of the map
            center: [0.0, 0.0],
            zoomLevel: 2,
            components: [
                //ZoomBar provides a UI to zoom the map in & out
                new nokia.maps.map.component.ZoomBar(),
                // We add the behavior component to allow panning / zooming of the map
                new nokia.maps.map.component.Behavior(),
                // Creates UI to easily switch between street map satellite and terrain mapview modes
                new nokia.maps.map.component.TypeSelector(),
                /* Shows a scale bar in the bottom right corner of the map depicting
                 * ratio of a distance on the map to the corresponding distance in the real world
                 * in either kilometers or miles
                 */
                new nokia.maps.map.component.ScaleBar(),
                infoBubbles
            ]
        });
        
        try {
        	// Creating Heatmap overlay
        	heatmapProvider = new nokia.maps.heatmap.Overlay({
        		// This is the greatest zoom level for which the overlay will provide tiles
        		max: 20,
        		// This is the overall opacity applied to this overlay
        		opacity: 0.6,
        		// Defines if our heatmap is value or density based
        		type: "value",
        		// Coarseness defines the resolution with which the heat map is created.
        		coarseness: 6
        	});
        	
        	map.overlays.add(heatmapProvider);
        } catch (e) {
        	// The heat map overlay constructor throws an exception if there
        	// is no canvas support in the browser
        	alert(typeof e == "string" ? e : e.message);
        }

    },
    
    onProductSelected: function(oEvent, oController) {
        oController.loadDataForProduct(oController.getView().selector.getSelectedKey() , 
                oController.getView() );
    },
    
    loadDataForProduct: function(productID, view) {
        view.oSalesChart.bindRows({
            path: '/ProductSales',
            filters: [
                new sap.ui.model.Filter("PRODUCTID_PRODUCTID", "EQ", productID)    
            ]
        });
        
        OData.read("/sap/hana/democontent/epmNext/spatial/services/productSales.xsodata/ProductRegionQuantity?$filter=PRODUCTID_PRODUCTID eq '"
                    + productID + "'",
          function (data, request) {
                // Only start loading data if the heat map overlay was successfully created
                if (heatmapProvider && data.results) {    
                    var mapData = [];
                    for (var i = 0; i < data.results.length; i++) {
                        mapData.push({
                            latitude: data.results[i].LATITUDE,
                            longitude: data.results[i].LONGITUDE,
                            value: data.results[i].QUANTITY
                        });
                    }
                    
                    heatmapProvider.clear();
                    
                    // Rendering the heat map overlay onto the map
				    heatmapProvider.addData(mapData);
                }
          }, function(err){
            alert("Error occurred " + err.message);
        });
    }
});