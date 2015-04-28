(function() {
	//No Longer Needed in SPS09 - We can now create Full Text Index via HDBDD and put it the DU - No need to create on the fly
    body = 'ok';
    $.response.status = $.net.http.OK;
    
    'use strict';
/*    //initialize variables
    var conn = null,
        body = '',
        prepStat = null;
    //initial database setup, create fulltext indizes
    try {
        //get connection
        conn = $.db.getConnection();
        // --- epm_texts
        prepStat = conn.prepareStatement('CREATE FULLTEXT INDEX TEXTS_INDEX ON "SAP_HANA_DEMO"."sap.hana.democontent.epm.data::EPM.Util.Texts"("TEXT")');
        prepStat.execute();
        prepStat.close();

        // --- commit changes and close connection
        conn.commit();
        conn.close();
        body = 'ok';
        $.response.status = $.net.http.OK;
    } catch (e) {
        // 289: index already exists, thats ok
        if (e.code && e.code !== 289) {
            body = e.message;
            $.response.status = $.net.http.BAD_REQUEST;
        } else {
            body = 'exists';
            $.response.status = $.net.http.NOT_MODIFIED;
        }
    }*/
    $.response.contentType = 'text/plain';
    $.response.setBody(body);
}());