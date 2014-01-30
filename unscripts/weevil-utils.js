function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function randomUUID() {
    var s = [],
    itoh = '0123456789ABCDEF';

    for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);

    s[14] = 4; // Set 4 high bits of time_high field to version
    s[19] = (s[19] & 0x3) | 0x8; // Specify 2 high bits of clock sequence
    for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];

    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
}

function GetHttpRequest() {
    if (window.XMLHttpRequest) // Gecko
    return new XMLHttpRequest();
    else if (window.ActiveXObject) // IE
    return new ActiveXObject("MsXml2.XmlHttp");
}

function StringtoXML(text) {
    if (window.ActiveXObject) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    } else {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}

function debug(cdiv, msg) {
    var cTime = new Date();
    var hr = cTime.getHours();
    var mi = cTime.getMinutes();
    var se = cTime.getSeconds();
    var mo = cTime.getMonth() + 1;
    var dy = cTime.getDate();
    var yr = cTime.getFullYear();
    var timeString = hr+":"+mi+":"+se+" "+dy+"/"+mo+"/"+yr;
    var console = document.getElementById(cdiv);
    console.innerHTML = console.innerHTML + "<br>" + timeString+" "+msg;
}

function removeElementById(id) {
    var element = document.getElementById(id);
    if (element != null) {
        element.parentNode.removeChild(element);
    }
}

function swapDivText(id,text) {
    var element = document.getElementById(id);
    if (element != null) {
        var parentNode = element.parentNode;
        parentNode.removeChild(element);
	var newDiv = document.createElement("div");
	newDiv.setAttribute("id", id);
  	var newContent = document.createTextNode(text);
  	newDiv.appendChild(newContent);
	parentNode.appendChild(newDiv);	
    }
}


