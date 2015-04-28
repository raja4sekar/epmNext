$.import("sap.hana.xs.libs.dbutils", "xsds");
var XSDS = $.sap.hana.xs.libs.dbutils.xsds;
$.import("sap.hana.democontent.epmNext.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epmNext.services.session;

function bpCreateBuyer(param) {
	bpCreateBusinessPartner(param,'01');
}

function bpCreateSupplier(param) {
	bpCreateBusinessPartner(param,'02');
}

function bpCreateBusinessPartner(param,partnerRole){

	XSDS.Transaction.conn = param.connection;
	XSDS.Transaction.$setAutoCommit(false);
	
	
	let afterTable = param.afterTableName;
	afterTable = '"' + afterTable + '"';
	//Get Input New Record Values
	var InputBP = XSDS.$defineEntity("Details", afterTable, {
	    Id : { $key: true }
	});
	var input = InputBP.$findAll(); 
	
	//Validate Email
	if(!validateEmail(input[0].EmailAddress)){
		throw 'Invalid email for company '  + input[0].CompanyName + 
        ' No Way! E-Mail must be valid and ' + input[0].EmailAddress + ' has problems';
	} 
	
	
	var oBP = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.BusinessPartner", 
			 { PARTNERID: { $key:  '"SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::businessPartnerId"' }
			 });
	var oAddress = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.Addresses", 
			 { ADDRESSID: { $key:  '"SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::addressId"' }
			 });
	var oEmployee = XSDS.$importEntity("sap.hana.democontent.epmNext.data", "MD.Employees");

	// create new Address
	var newAddress = new oAddress({
	 CITY:  input[0].City,
	 COUNTRY: input[0].Country,
	 REGION: input[0].Region,
    });
	newAddress.$save();
	
	//Lookup Employee
	var employee = oEmployee.$find({ LOGINNAME: "EPM_USER" }); 
	
	// create new Business Partner
	var newBP = new oBP({ 
	 PARTNERROLE: partnerRole,
	 EMAILADDRESS: input[0].EmailAddress,
	 COMPANYNAME:  input[0].CompanyName,
	 ADDRESSES: newAddress,
	 HISTORY: { CREATEDBY: employee, CREATEDAT: new Date(), CHANGEDBY: employee, CHANGEDAT: new Date() }
    });
	newBP.$save();
	
};


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 