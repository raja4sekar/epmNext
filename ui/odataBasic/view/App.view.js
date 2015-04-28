sap.ui.jsview("view.App", { 

        getControllerName: function() {
            return "view.App"; 
        },

        createContent: function(oController) {
	        this.addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode

            var oTable = new sap.m.Table("bpTable", {
                tableId: "bpTable",
                growingThreshold: 10,
                growing: true
            });
            var sort1 = new sap.ui.model.Sorter("PARTNERID");
            var columnList = new sap.m.ColumnListItem();
            oTable.bindItems({
                path: "bpModel>/BusinessPartners",
                template: columnList,
                sorter: sort1
            });

            //Table Column Definitions 
            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Partner ID"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>PARTNERID"
                },
                name: "PARTNERID"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Email Address"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>EMAILADDRESS"
                },
                name: "EMAILADDRESS"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Phone Number"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>PHONENUMBER"
                },
                name: "PHONENUMBER"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Fax Number"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>FAXNUMBER"
                },
                name: "FAXNUMBER"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Legal Form"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>LEGALFORM"
                },
                name: "LEGALFORM"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Currency"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Text({
                text: {
                    path: "bpModel>CURRENCY"
                },
                name: "CURRENCY"
            }));

            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    text: "Web Address"
                }),
                width: "125px"
            }));
            columnList.addCell(new sap.m.Link({
                text: {
                    path: "bpModel>WEBADDRESS"
                },
                href: {
                    path: "bpModel>WEBADDRESS"
                },
                target: "_blank",
                name: "WEBADDRESS"
            }));

        var displayPanel = new sap.m.Panel("dispPanel").setHeaderText('Business Partner Details');
        displayPanel.setExpandable(true);
        displayPanel.setExpanded(true);

        displayPanel.addContent(oTable);
       return displayPanel;
    }
});