//To use a javascript controller its name must end with .controller.js
sap.ui.controller("view.App", {
    onInit: function() {
        var model = new sap.ui.model.json.JSONModel({});
        var view = this.getView();
        view.setModel(model);
        view.addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
        view.byId("Object").setFilterFunction(this.getView().getController().filterFunction);
        view.byId("Extension").setFilterFunction(this.getView().getController().filterFunction);
    },

    filterFunction: function(sTerm, oItem) {
        if (sTerm === "*") {
            return true;
        } else {
            return jQuery.sap.startsWithIgnoreCase(oItem.getText(), sTerm);
        }
    },

    escapeHtml: function(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
           "\"": "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "{": "&#123;",
            "}": "&#125"
        };

        return String(string).replace(/[&<>"'\/{}]/g, function(s) {
            return entityMap[s];
        });
    },

    //Package Filter
    loadPackageFilter: function(oEvent) {
        var oController = this.getView().getController();
        var gSearchParam = oEvent.getParameter("suggestValue");
        var aUrl = "/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getPackages&package=" + escape(gSearchParam);
        jQuery.ajax({
            url: aUrl,
            method: "GET",
            dataType: "json",
            success: oController.onLoadPackageFilter,
            error: oController.onErrorCall
        });

    },
    onLoadPackageFilter: function(myJSON) {
        var oSearchControl = sap.ui.getCore().byId("app--Package");
        oSearchControl.destroySuggestionItems();
        for (var i = 0; i < myJSON.length; i++) {
            oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                text: myJSON[i].PACKAGE_ID
            }));
        }
    },

    //Object Filter
    loadObjectFilter: function(oEvent) {
        var oController = this.getView().getController();
        var searchParam = oEvent.getParameter("suggestValue");
        if (typeof(searchParam) !== "undefined") {
            if (searchParam === "*") {
                searchParam = "";
            }
        } else {
            searchParam = "";
        }
        var packageName = sap.ui.getCore().byId("app--Package").getValue();
        var aUrl = "/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getObjList&package=" + escape(packageName) + "&obj=" + searchParam;
        jQuery.ajax({
            url: aUrl,
            method: "GET",
            dataType: "json",
            success: oController.onLoadObjFilter,
            error: oController.onErrorCall
        });
    },
    onLoadObjFilter: function(myJSON) {
        var oSearchControl = sap.ui.getCore().byId("app--Object");
        oSearchControl.destroySuggestionItems();
        for (var i = 0; i < myJSON.length; i++) {
            oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                text: myJSON[i].OBJECT_NAME
            }));

        }
    },

    //Extension Filter
    loadExtFilter: function() {
        var oController = this.getView().getController();
        var searchParam = sap.ui.getCore().byId("app--Object").getValue();


        if (typeof(searchParam) !== "undefined") {
            if (searchParam === "*") {
                searchParam = "";
            }
        } else {
            searchParam = "";
        }
        var packageName = sap.ui.getCore().byId("app--Package").getValue();
        var aUrl = "/sap/hana/democontent/epmNext/services/repository.xsjs?cmd=getExtList&package=" + escape(packageName) + "&obj=" + searchParam;
        jQuery.ajax({
            url: aUrl,
            method: "GET",
            dataType: "json",
            success: oController.onLoadExtFilter,
            error: oController.onErrorCall
        });
    },
    onLoadExtFilter: function(myJSON) {
        var oSearchControl = sap.ui.getCore().byId("app--Extension");
        oSearchControl.destroySuggestionItems();
        for (var i = 0; i < myJSON.length; i++) {
            oSearchControl.addSuggestionItem(new sap.ui.core.Item({
                text: myJSON[i].OBJECT_SUFFIX
            }));

        }
    },

    // Display chosen file
    onRepoDisplay: function() {
        var oController = this.getView().getController();
        var shortUrl = "/sap/hana/xs/dt/base/file/";
        var packageVal = sap.ui.getCore().byId("app--Package").getValue();
        var path = packageVal.replace(/[.]/g, "/");
        var url = shortUrl + path;
        url += "/" + sap.ui.getCore().byId("app--Object").getValue() + "." + sap.ui.getCore().byId("app--Extension").getValue();

        var oSapBackPack = {};
        oSapBackPack.Workspace = "__empty__";
        var sapBackPack = JSON.stringify(oSapBackPack);

        jQuery.ajax({
            url: url,
            method: "GET",
            headers: {
                "SapBackPack": sapBackPack
            },
            success: oController.onInsertContent,
            error: oController.onErrorCall
        });
    },
    
    onInsertContent: function(myTXT) {
        var oController = sap.ui.getCore().byId("app").getController();
        var html = new sap.ui.core.HTML({
            // static content
            content: "<div id=\"content1\" class=\"wiki\"><div class=\"code\"><pre>" + oController.escapeHtml(myTXT) + "\n" + "</pre></div></div>",
            preferDOM: false
        });
        sap.ui.getCore().byId("app--PanelContent").removeAllContent();
        sap.ui.getCore().byId("app--PanelContent").addContent(html);
    },
    
    onErrorCall: function(jqXHR) {
        if (jqXHR.responseText === "NaN") {
            sap.m.MessageBox.alert("Invalid Input Value");
        } else {
            sap.m.MessageBox.alert(escape(jqXHR.responseText) );
        }
        return;
    }

});