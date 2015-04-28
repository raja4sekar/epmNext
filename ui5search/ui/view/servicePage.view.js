sap.ui.jsview("sap.shine.esh.view.servicePage", {

    getControllerName: function() {
        return "sap.shine.esh.view.servicePage";
    },

    createContent: function(oController) {
        var that = this;

        
        // create app
        var app = new sap.m.App({
            id: this.createId("explorer"),
            backgroundImage: "images/fernglas.jpeg"
        });
        
        
        var settings = this.getViewData();

        //define page
        var servicePage = new sap.m.Page({
            title: settings.title
        });

        //page header + info popout
        var infoPopover = sap.ui.jsfragment("fragment.infoPopover", oController);

        servicePage.addHeaderContent(
            new sap.m.Button({
                icon: "sap-icon://hint",
                press: function(evt) {
                    infoPopover.openBy(evt.getSource());
                }
            })
        );

        //container for table and facets
        
        //container for table/facet switch and sort-selector
        var controlContainer = new sap.m.VBox({});

        //search bar
        var searchBar = new sap.m.SearchField({
            id: this.createId(settings.ID + "searchBar"),
            search: function(evt) {
                oController.clearCheckedFacets();
                oController.search(evt);
            }
        });
        searchBar.addStyleClass("searchBar");

        servicePage.addContent(searchBar);
        servicePage.addContent(controlContainer);

        var controlGrid = new sap.ui.layout.Grid({
            hSpacing: 0,
            content: [
                new sap.m.SegmentedButton({
                    buttons: [
                        new sap.m.Button({
                            id: this.createId(settings.ID + "-tableButton"),
                            text: "Table"
                        }),
                        new sap.m.Button({
                            id: this.createId(settings.ID + "-facetsButton"),
                            text: "Facets"
                        })
                    ],
                    layoutData: new sap.ui.layout.GridData({
                        span: "L12 M12 S12",
                        visibleL: false,
                        visibleM: false
                    }),
                    select: function(evt) {
                        oController.switchControls(evt);
                    }
                }),
                new sap.m.Select({
                    id: this.createId(settings.ID + "sortBySelector"),
                       layoutData: new sap.ui.layout.GridData({
                        span: "L6 M6 S12"
                    }),
                    change: function() {
                        oController.handleSortChange();
                    }
                }),
                new sap.m.SegmentedButton({
                    id: this.createId(settings.ID + "-ascDscSegButtons"),
                    buttons: [
                        new sap.m.Button({
                            id: this.createId(settings.ID + "-ascendingButton"),
                            text: "Ascending"
                        }),
                        new sap.m.Button({
                            id: this.createId(settings.ID + "-descendingButton"),
                            text: "Descending"
                        })
                    ],
                    layoutData: new sap.ui.layout.GridData({
                        span: "L6 M6 S12"
                    }),
                    select: function() {
                        oController.handleSortChange();
                    }
                })

            ]
        });
        controlGrid.addStyleClass("controlGrid");
        controlContainer.addItem(controlGrid);
    
        //table for displaying the results
        var resultTable = new sap.m.Table({
            id: this.createId(settings.ID + "-resultTable"),
            mode: sap.m.ListMode.SingleSelectMaster,
            growing: true,
            growingThreshold: 50,
            layoutData: new sap.ui.layout.GridData({
                span: "L9 M9 S12"
            })
        });

        //andre's custom facet control - TODO replace with Mathias one, when finished
        var facetHeader = new sap.m.Label({
            text: '{facets>@com.sap.vocabularies.Common.v1.Label}'
        });

        var checkbox = new sap.m.CheckBox({
            select: function(evt) {
                oController.filterByFacet();
            }
        });

        var facetValue = new sap.m.InputListItem({
            label: '{facets>Label} ({facets>_Count})',
            content: [checkbox]
        });
        
        

        var facetValueList = new sap.m.List({
            items: {
                path: 'facets>Items',
                template: facetValue
            }
        });

        var facet = new sap.m.CustomListItem({
            id: this.createId(settings.ID + "-facet"),
            content: [facetHeader, facetValueList]
        });

        var facetList = new sap.m.List({
            id: this.createId(settings.ID + "-facetList"),
            headerText: 'Facets',
            layoutData: new sap.ui.layout.GridData({
                span: "L3 M3 S12",
                visibleOnSmall: false
            })
        });
        
        var tableFacetContainer = new sap.ui.layout.Grid({
            content: [facetList, resultTable]
        });
        servicePage.addContent(tableFacetContainer);

        app.addPage(servicePage);

        return app;
    }
});