var connection = $.hdb.getConnection();

var partnerRole = $.request.parameters.get("PartnerRole");
partnerRole = typeof partnerRole !== 'undefined' ? partnerRole : '01';

var getBpAddressesByRole = connection.loadProcedure("SAP_HANA_EPM_NEXT", 
	"sap.hana.democontent.epmNext.procedures::get_bp_addresses_by_role");

var results = getBpAddressesByRole(partnerRole);

//Pass output to response		
$.response.status = $.net.http.OK;
$.response.contentType = "application/json";
$.response.setBody(JSON.stringify(results));

