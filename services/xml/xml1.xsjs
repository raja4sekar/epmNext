//create a new $.util.SAXParser object
var parser = new $.util.SAXParser();

//parse XML from String
var parser = new $.util.SAXParser();
var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
          '<!-- this is a note -->\n'+
           '<note noteName="NoteName">'+
               '<to>To</to>'+
               '<from>From</from>'+
               '<heading>Note heading</heading>'+
               '<body>Note body</body>'+
           '</note>';
var startElementHandlerConcat = "";
var endElementHandlerConcat = "";
var characterDataHandlerConcat = "";

parser.startElementHandler = function(name, atts) {
    startElementHandlerConcat += name;
    if (name === "note") {
        startElementHandlerConcat += " noteName = '" + atts.noteName + "'";
    }
    startElementHandlerConcat += "\n";
};
parser.endElementHandler = function(name) {
    endElementHandlerConcat += name + "\n";
};
parser.characterDataHandler = function(s) {
    characterDataHandlerConcat += s;
};
parser.parse(xml);

var body = 'Start: ' + startElementHandlerConcat + '</br>' +
           'End: ' + endElementHandlerConcat + '</br>' +
           'Charcter: ' + characterDataHandlerConcat + '</br>';

$.response.status = $.net.http.OK; 
$.response.contentType = "text/html";
$.response.setBody(body); 