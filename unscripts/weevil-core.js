var id = "";
var dtime = 0;
var cjobs = 0;
id = randomUUID();

window.onbeforeunload = function() {
    if (id != "") {
        //TODO if connected
        var AJs = new XMLHttpRequest();
        AJs.open("GET", "cgi-bin/loader.cgi?cmd=end&id=" + id, false);
        AJs.send(null);
    }
}

function getFunctionParamList(functionText) {
    var myregx = /weevil_main[\s]*\([\w\,\s]+\)/;
    var myregx2 = /\([\w\,\s]+\)/;
    if (functionText.match(myregx)) {
        var str1 = new String(functionText.match(myregx)[0]);
        var str2 = new String(str1.match(myregx2));
        var str3 = str2.substr(1, str2.length - 2);
        var inputs = str3.split(",");
        for (i = 0; i < inputs.length; i++) {
            inputs[i] = inputs[i].replace(/^\s+|\s+$/g, '');
        }
        return inputs;
    }
    return[];
}

function getWeevilList() {
    var xmlReq = GetHttpRequest();
    var xmlStr;
    xmlReq.open("GET", "cgi-bin/loader.cgi?cmd=getstore&id=" + id, false);
    xmlReq.send(null);
    if (xmlReq.status == 200) {
        xmlStr = StringtoXML(xmlReq.responseText);
    }
    return xmlStr;
}

function joinWeevilNetwork() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    }
    var worker = new Worker("scripts/grabber.js");
    var paramHash;
    var regxfloat = /^[-+]?\d+(\.\d+){1}$/;
    var regxint = /^[-+]?\d+$/;
    worker.addEventListener('message', function(e) {
        var xmlDoc = StringtoXML(e.data);
        paramHash = new Object();
	var startTime;
	var stopTime;

        var script = xmlDoc.getElementsByTagName("source")[0].childNodes[0].nodeValue;
        var job_id = xmlDoc.getElementsByTagName("job-id")[0].childNodes[0].nodeValue;
        var job_name = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        debug("tab1.bottom", "[Info] Starting job: " + job_name);
        var params = xmlDoc.getElementsByTagName("parameters")[0].childNodes;
        for (k = 0; k < params.length; k++) {
            if (!params[k].nodeName.match("#text")) {
                if (params[k].firstChild.nodeValue.match(regxint)) {
                    paramHash[params[k].nodeName] = parseInt(params[k].firstChild.nodeValue);
                } else {
                    if (params[k].firstChild.nodeValue.match(regxfloat)) {
                        paramHash[params[k].nodeName] = parseFloat(params[k].firstChild.nodeValue);
                    } else {
                        paramHash[params[k].nodeName] = (params[k].firstChild.nodeValue != "null") ? params[k].firstChild.nodeValue : null;
                    }
                }
            }
        }
        var thread = new Worker(script);
        thread.onerror = function(e) {
            var job_name = e.filename.substring(e.filename.lastIndexOf("/") + 1, e.filename.length - 3);
            debug("tab1.bottom", "[Error] In " + job_name);
            var sdata = "cmd=submit&job_id=" + encodeURIComponent(job_id) + "&job_name=" + job_name + "&id=" + encodeURIComponent(id) + "&status=3&result=" + encodeURIComponent("[Error] " + e.message);
            var AJ = new GetHttpRequest();
            AJ.open("POST", "cgi-bin/loader.cgi", false);
            AJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            AJ.setRequestHeader("Content-length", params.length);
            AJ.setRequestHeader("Connection", "close");
            AJ.send(sdata);
            worker.postMessage({
                'id': id
            });
            thread.postMessage({
                'cmd': 'stop'
            });
	    stopTime = new Date();
	    var tdiff = Math.abs(stopTime - startTime);
	    dtime = dtime + tdiff;
	    swapDivText("tstate","Idling");
	    swapDivText("dtime",(dtime / 1000)+"s");
        }
        thread.addEventListener('message', function(e) {
            var sdata = "cmd=submit&job_id=" + encodeURIComponent(job_id) + "&job_name=" + job_name + "&id=" + encodeURIComponent(id) + "&status=2&result=" + encodeURIComponent(e.data);
            var AJ = new GetHttpRequest();
            debug("tab1.bottom", "[Info] Completed job: " + job_name);
            AJ.open("POST", "cgi-bin/loader.cgi", false);
            AJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            AJ.setRequestHeader("Content-length", params.length);
            AJ.setRequestHeader("Connection", "close");
            debug("tab1.bottom", "[Info] Submitted results for job: " + job_name);
            AJ.send(sdata);
            worker.postMessage({
                'id': id
            });
            thread.postMessage({
                'cmd': 'stop'
            });
	    stopTime = new Date();
	    var tdiff = Math.abs(stopTime - startTime);
	    dtime = dtime + tdiff;
	    cjobs = cjobs + 1;
	    swapDivText("tstate","Idling");
	    swapDivText("cjobs",cjobs);
	    swapDivText("dtime",(dtime / 1000)+"s");
        },
        false);
        paramHash["cmd"] = "start";
	startTime = new Date();
        thread.postMessage(paramHash);	
	swapDivText("tstate","Working");
    },
    false);
    worker.postMessage({
        'id': id
    });
}

function enqueueWeevil(weevilStr) {
    var oSendXml = GetHttpRequest();

    var params = "cmd=enqueue&id=" + id + "&weevil=" + encodeURIComponent(weevilStr);
    oSendXml.open('POST', "cgi-bin/loader.cgi", false);
    oSendXml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    oSendXml.setRequestHeader("Content-length", params.length);
    oSendXml.setRequestHeader("Connection", "close");
    oSendXml.send(params);
    debug("tab2.bottom", "[Info] Submitted job: " + document.getElementById("weevil_name").value);
}

function success(position) {

    var lat = position.coords.latitude;
    var log = position.coords.longitude;
    var markers = [];
    var malta = new google.maps.LatLng(35, 14);
    var myOptions = {
        zoom: 3,
        center: malta,
        mapTypeControl: false,
        navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapi = new google.maps.Map(document.getElementById("content"), myOptions);
    var mcOptions = {
        gridSize: 30,
        maxZoom: 13
    };
    var mc = null;

    debug("tab1.bottom", "[Info] user id: " + id);

    var heartbeat = new Worker("scripts/heartbeat.js");
    var gInterval = setInterval(hb, 30000);

    heartbeat.addEventListener('message', function(e) {
        var xmlDoc = StringtoXML(e.data);

        var weevils = xmlDoc.getElementsByTagName("weevil");
        if (weevils.length > 0) {
            (function() {
                var myColumnDefs = [{
                    key: "id",
                    sortable: true,
                    resizeable: true
                },
                {
                    key: "name",
                    sortable: true,
                    resizeable: true
                },
                {
                    key: "status",
                    sortable: true,
                    resizeable: true
                },
                {
                    key: "queued time",
                    formatter: YAHOO.widget.DataTable.formatDate,
                    sortable: true,
                    sortOptions: {
                        defaultDir: YAHOO.widget.DataTable.CLASS_DESC
                    },
                    resizeable: true
                },
                {
                    key: "duration",
                    sortable: true,
                    resizeable: true
                },
                {
                    key: "results",
                    sortable: false,
                    resizeable: true
                }
                //{key:"executed by"	, sortable:true, resizeable:true}
                ];
                var dataSource = new Array();
                for (k = 0; k < weevils.length; k++) {
                    var data = weevils[k].childNodes[0].nodeValue.split("##");
                    var wState = "undefined";
                    if (data[1] == 0) wState = "queued";
                    if (data[1] == 1) wState = "running";
                    if (data[1] == 2) wState = "complete";
                    if (data[1] == 3) wState = "error";

                    var o = {};
                    o["id"] = "<a href=jobs/" + data[0] + ".xml target='_blank'>" + data[0] + "</a>";
                    o["name"] = "<a href=jobs/" + data[2] + ".js target='_blank'>" + data[2] + "</a>";
                    o["status"] = wState;
                    o["queued time"] = data[3];
                    o["duration"] = data[4];
                    o["results"] = "<a href=results/" + data[2] + "/" + data[0] + "_OUT.html target='_blank'>results</a>";
                    dataSource.push(o);
                }
                var myDataSource = new YAHOO.util.DataSource(dataSource);
                myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
                myDataSource.responseSchema = {
                    fields: ["id", "name", "status", "queued time", "duration", "results"]
                };
                var myDataTable = new YAHOO.widget.DataTable("tab3.center", myColumnDefs, myDataSource, {
                    caption: "Weevil Stats"
                });

            })();
        }

        var csize = xmlDoc.getElementsByTagName("csize")[0].childNodes[0].nodeValue;
        swapDivText("csize", csize);
        var bogoflops = xmlDoc.getElementsByTagName("flops")[0].childNodes[0].nodeValue;
        swapDivText("flops", bogoflops);

        (function() {
            var geops = xmlDoc.getElementsByTagName("geop");
            var markers = new Array();

            for (i = 0; i < geops.length; i++) {
                var loc = geops[i].childNodes[0].nodeValue.split(":");
                var latlng = new google.maps.LatLng(loc[0], loc[1]);
                var marker = new google.maps.Marker({
                    position: latlng,
                    title: loc[2]
                });
                markers.push(marker);
            }
            if (mc != null) {
                mc.clearMarkers();
                mc.addMarkers(markers);
            } else {
                mc = new MarkerClusterer(mapi, markers, mcOptions);
            }
        })();

        //setTimeout(hb,2000);
        xmlDoc = null;

    },
    false);

    function hb() {
        heartbeat.postMessage({
            'id': id,
            'lat': lat,
            'log': log,
            'flops': avgFlops
        });
    }

    var flopsThread = new Worker("scripts/flopsCalc-min.js");
    var flopsItr = 0;
    var flopsAry = new Array();
    var avgFlops = 0;
    flopsThread.addEventListener("message", function(e) {
        flopsAry[flopsItr] = e.data.flops;
        flopsItr++;
        if (flopsItr < 3) {
            flopsThread.postMessage({
                'cmd': 'start'
            });
        } else {
            flopsThread.postMessage({
                'cmd': 'stop'
            });
            avgFlops = (flopsAry[0] + flopsAry[1] + flopsAry[2]) / 3
            heartbeat.postMessage({
                'id': id,
                'lat': lat,
                'log': log,
                'flops': avgFlops
            });
            var mflops = Math.round(avgFlops / 1000000);
            debug("tab1.bottom", "[Info] bogoflops: " + mflops + " Mflops");
        }

    },
    false);
    flopsThread.postMessage({
        'cmd': 'start'
    });

}
