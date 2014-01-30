self.addEventListener('message', function(e){

function doCall(){
	var id = e.data.id;
	var oXmlHttp = new XMLHttpRequest();
        oXmlHttp.open('GET',"../cgi-bin/loader.cgi?cmd=dequeue&id="+id,true);
	oXmlHttp.onreadystatechange = function(){
		if(oXmlHttp.readyState != 4) { return; }
		var txtDoc = oXmlHttp.responseText;
		var pat = /sleep/g;
		
		if(txtDoc != null){
			if(oXmlHttp.responseText.match(pat)){
				txtDoc = null;
				oXmlHttp = null;
				pat = null;
				id = null;
				setTimeout(doCall,25000);
			}else{
				self.postMessage(txtDoc);
			}
		}
	};
        oXmlHttp.send(null);
	//setTimeout(doCall,5000);
}
doCall();

}, false);
