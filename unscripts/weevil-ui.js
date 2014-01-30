(function() {
    var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event;

    Event.onDOMReady(function() {
	if(BrowserDetect.browser == "Explorer"){
		swapDivText("center1.inner", "This Browser Does not support HTML5!! Known supported browsers are latest releases of Chrome, Firefox and Opera.");
	}else{
        var layout = new YAHOO.widget.Layout('wrap', {
            height: Dom.getClientHeight(),
            width: Dom.get('wrap').offsetWidth,
            units: [{
                position: 'top',
                height: 100,
                body: 'top1',
                gutter: '1px',
                collapse: false,
                resize: false
            },
            {
                position: 'bottom',
                height: 50,
                resize: false,
                body: 'bottom1',
                gutter: '1px',
                collapse: false
            },
            {
                position: 'center',
                body: 'center1',
                gutter: '1px'
            }]
        });
        layout.on('beforeResize', function() {
            Dom.setStyle('wrap', 'height', Dom.getClientHeight() + 'px');
            Dom.setStyle('wrap', 'width', Dom.getClientWidth() + 'px');
            if (Dom.get('centerChild')) {
                var cw = Dom.get('centerChild').offsetWidth - 10;
                var ch = Dom.get('centerChild').offsetHeight - Dom.get('centerChild').firstChild.offsetHeight - 10;
                Dom.setStyle('wnetwork', 'height', ch + 'px');
                Dom.setStyle('wnetwork', 'width', cw + 'px');
                Dom.setStyle('wedit', 'height', ch + 'px');
                Dom.setStyle('wedit', 'width', cw + 'px');
                Dom.setStyle('tab3.center', 'width', cw + 'px');
                Dom.setStyle('tab3.center', 'height', ch + 'px');
            }
        });
        layout.on('render', function() {
            Event.onAvailable('center1', function() {
                var oCenter = document.getElementById("center1");
                var oButton = document.createElement('div');
                var oNote1 = document.createElement('div');
                var oNote2 = document.createElement('div');
                var ch = document.body.clientHeight / 2 - 200;
                var chn1 = document.body.clientHeight / 2 - 300;
                var cw = document.body.clientWidth / 2 - 100;
                var cwn2 = document.body.clientWidth / 2 + 120;
                var cwn1 = document.body.clientWidth / 2 - 650;
                oButton.id = 'joinBtn';
                oButton.style.left = cw + 'px';
                oButton.style.top = ch + 'px';
                oButton.style.width = '200px';
                oButton.style.height = '200px';
                oButton.style.position = 'absolute';
                oNote1.style.top = chn1 + 'px';
                oNote1.style.left = cwn1 + 'px';
                oNote1.style.width = '500px';
                oNote1.style.height = '370px';
                oNote1.style.position = 'absolute';
                oNote1.innerHTML = '<p class="header">What is This?</p><p class="answer">WeevilScout is an initiative to solve complex problems using a global network of browsers.</p><br/>\
					   <p class="header">How Does it Work?</p><p class="answer">When you click the start button your browser will be connected to a cluster of browsers. Once connected your browser can start computing tasks which are sent to it by WeevilScout server.</p><br/>\
<p class="header">News</p><p class="answer">None</p>';
                oCenter.appendChild(oNote1);
                oNote2.style.top = chn1 + 'px';
                oNote2.style.left = cwn2 + 'px';
                oNote2.style.width = '500px';
                oNote2.style.height = '370px';
                oNote2.style.position = 'absolute';
                oNote2.innerHTML = '<p class="header">Privacy Concern?</p><p class="answer">For sake of illustrating the cluster on Google maps you will be asked to share your location this is only used to show the distribution of the cluster on a global scale. A random user id is generated when you connect to the network so no lenghty registration procedures are required.</p><br/>\
					   <p class="header">Agreement</p><p class="answer">By clicking on the START button you are joining the WeevilScout network at you OWN risk and agree that your browser and therfore your computer will be used to execute JavaScript programs sent to it. </p>';
                oCenter.appendChild(oNote2);
                oCenter.appendChild(oButton);
                Dom.setAttribute('joinBtn', 'onclick', 'onJoinBtnClick()');
                var jb = document.getElementById('joinBtn');
                jb.onmouseover = function() {
                    this.style.cursor = 'pointer';
                };
                jb.innerHTML = '<img src="images/on.png"/>';
            });

            YAHOO.util.Event.addListener("mainTab2", "click", onTab2Click);

            function onTab2Click() {
                YAHOO.util.Event.removeListener("mainTab2", "click", onTab2Click);
                Event.onAvailable('editArea', function() {
                    editAreaLoader.init({
                        id: "editArea",
                        start_highlight: true,
                        allow_resize: "both",
                        allow_toggle: true,
                        word_wrap: true,
                        language: "en",
                        syntax: "js"
                    });
                });
            }

            Event.onAvailable('wnetwork', function() {

                var layout_tab1 = new YAHOO.widget.Layout('wnetwork', {
                    width: Dom.get('centerChild').offsetWidth - 10,
                    height: Dom.get('centerChild').offsetHeight - Dom.get('centerChild').firstChild.offsetHeight - 10,
                    units: [{
                        position: 'bottom',
                        header: 'Console',
                        gutter: '0px',
                        height: '100px',
                        resize: true,
                        proxy: false,
                        body: 'tab1.bottom',
                        scroll: true,
                        gutter: '5 0 0 0',
                        collapse: true,
                        maxHeight: 500,
                        animate: true
                    },
                    //{ position: 'left', gutter: '0px', width:'150px', resize: true, proxy: false, body: 'tab1.left', gutter: '0 5 0 0', collapse: true, animate: true },
                    {
                        position: 'center',
                        body: 'tab1.center',
                        width: '100%',
                        gutter: '0 0 0 0',
                        scroll: false
                    }]
                });
                layout_tab1.render();
                //layout_tab1.getUnitByPosition('left').toggle();
                layout_tab1.getUnitByPosition('bottom').toggle();
            }); //Event.onAvailable('wnetwork', function()
            Event.onAvailable('wedit', function() {
                var layout_tab2 = new YAHOO.widget.Layout('wedit', {
                    width: Dom.get('centerChild').offsetWidth - 10,
                    height: Dom.get('centerChild').offsetHeight - Dom.get('centerChild').firstChild.offsetHeight - 10,
                    units: [{
                        position: 'bottom',
                        header: 'Console',
                        gutter: '0px',
                        height: '100px',
                        resize: true,
                        proxy: false,
                        body: 'tab2.bottom',
                        scroll: true,
                        gutter: '5 0 0 0',
                        collapse: true,
                        maxHeight: 500,
                        animate: true
                    },
                    {
                        position: 'left',
                        header: 'Library',
                        gutter: '0px',
                        width: '200px',
                        resize: true,
                        proxy: false,
                        body: 'tab2.left',
                        gutter: '0 5 0 0',
                        collapse: true,
                        animate: true
                    },
                    {
                        position: 'center',
                        body: 'tab2.center',
                        width: '100%',
                        gutter: '0 0 0 0',
                        scroll: false
                    }]
                });
                layout_tab2.render();
                loadTab2Center();
                loadTab2Left();
            }); //Event.onAvailable('wedit', function()
        });

        function loadTab2Center() {
            var editPanelRoot = new YAHOO.util.Element('tab2.center', {
                id: 'editPanelRoot',
            });

            var oToolbarDiv = document.createElement('div');
            oToolbarDiv.setAttribute('id', 'editPanelToolbar');
            oToolbarDiv.style.height = '5%';
            var oPannelDiv = document.createElement('div');
            oPannelDiv.setAttribute('id', 'editPanel');
            oPannelDiv.style.width = '98%';
            oPannelDiv.style.height = '87%';

            document.getElementById('editPanelRoot').appendChild(oToolbarDiv);
            document.getElementById('editPanelRoot').appendChild(oPannelDiv);

            var inputPanel = new YAHOO.widget.Panel("inputPanel", {
                fixedcenter: true,
                width: "500px",
                visible: false,
                draggable: true,
                close: true
            });
            inputPanel.setHeader("Panel #2 from Script &mdash; This Panel Is Draggable");
            inputPanel.setBody('<div id="editPanel2" style="max-height: 400px; overflow:auto"></div>');
            inputPanel.setFooter("End of Panel #2");
            inputPanel.render(document.body);

            var submitPanel = new YAHOO.widget.Panel("submitPanel", {
                fixedcenter: true,
                width: "500px",
                visible: false,
                draggable: true,
                close: true
            });
            submitPanel.setHeader("Submit Weevil");
            submitPanel.setBody('<div id="submitPanel2" style="max-height: 400px; overflow:auto"></div>');
            submitPanel.setFooter("");
            submitPanel.render(document.body);

            var oButton2 = new YAHOO.widget.Button({
                id: "btn_2",
                type: "button",
                label: "Submit",
                container: "editPanelToolbar",
                onclick: {
                    fn: onSubmit
                }
            });
            Dom.setStyle('editPanelRoot', 'width', '100%');
            Dom.setStyle('editPanelRoot', 'height', '100%');
            Dom.setStyle('editPanel', 'margin', '1em');
            var txtBox = document.createElement('textarea');
            txtBox.id = 'editArea';
            txtBox.style.width = '100%';
            txtBox.style.height = '100%';
            txtBox.innerHTML = "/*Write your Weevil here*/ \n\n\nfunction weevil_main(a, b) {\n	return a+b; \n}";

            document.getElementById('editPanel').appendChild(txtBox);

            function onSubmit() {
                var cell = document.getElementById("submitPanel2");
                if (cell.hasChildNodes()) {
                    while (cell.childNodes.length >= 1) {
                        cell.removeChild(cell.firstChild);
                    }
                }
                var oP = document.createElement('p');
                oP.innerHTML = "Weevil Name: ";
                var oText = document.createElement('textarea');
                oText.id = "weevil_name";
                document.getElementById('submitPanel2').appendChild(oP);
                document.getElementById('submitPanel2').appendChild(oText);

                var inputs = getFunctionParamList(editAreaLoader.getValue("editArea"));
                for (i = 0; i < inputs.length; i++) {
                    var oInputDivT = document.createElement('div');
                    var oInputDivI = document.createElement('div');
                    var oCheckBox = document.createElement("input");
                    oCheckBox.id = 'mult_input' + inputs[i];
                    oCheckBox.type = "checkbox";
                    oCheckBox.value = "test";
                    oCheckBox.checked = false;
                    //oCheckBox.style.float = "right";
                    var oCheckBoxText = document.createElement('p');
                    //oCheckBoxText.style.float = "right";			
                    oCheckBoxText.innerHTML = "Multiple Inputs ";
                    oInputDivT.innerHTML = "<p>Value for parameter: " + inputs[i] + "</p>";
                    oInputDivI.innerHTML = '<textarea id="input' + inputs[i] + '"></textarea>';
                    document.getElementById('submitPanel2').appendChild(oInputDivT);
                    document.getElementById('submitPanel2').appendChild(oInputDivI);
                }
                document.getElementById('submitPanel2').appendChild(document.createElement('div'));
                var oButton3 = new YAHOO.widget.Button({
                    id: "btn_5",
                    type: "button",
                    label: "Submit",
                    container: "submitPanel2",
                    onclick: {
                        fn: sendWeevil
                    }
                });
                submitPanel.show();

                function sendWeevil() {
                    var weevilStr = "<weevil>\n";
                    weevilStr = weevilStr + "<name>" + trim(document.getElementById("weevil_name").value) + "</name>\n";
                    weevilStr = weevilStr + getXmlParameters();
                    weevilStr = weevilStr + "<source>";
                    var srcStr = editAreaLoader.getValue("editArea");
                    srcStr = srcStr.replace(/&/g, "&amp;");
                    srcStr = srcStr.replace(/</g, "&lt;");
                    srcStr = srcStr.replace(/>/g, "&gt;");
                    srcStr = srcStr.replace(/"/g, "&quot;");
                    srcStr = srcStr.replace(/'/g, "&apos;");
                    weevilStr = weevilStr + srcStr;
                    weevilStr = weevilStr + "</source>\n</weevil>";
                    enqueueWeevil(weevilStr);
                    submitPanel.hide();
                }

            }
            function onInputs() {
                inputPanel.show();
                var cell = document.getElementById("editPanel2");
                if (!cell.hasChildNodes()) {
                    //onRefreshInputs();
                }
            }

            function getXmlParameters() {
                var inputs = getFunctionParamList(editAreaLoader.getValue("editArea"));
                var paramStr = "<parameters>\n";
                //var regx = /[\D+]/;
                for (i = 0; i < inputs.length; i++) {
                    var obk = document.getElementById("input" + inputs[i]);
                    var mult = document.getElementById("mult_input" + inputs[i]);
                    obk.value = trim(obk.value);
                    if (obk.value) {
                        //if(mult.checked == true){
                        var params = obk.value.split(/\r\n|\r|\n/);
                        var paramList = "";
                        for (j = 0; j < params.length; j++) {
                            paramList = paramList + "<" + inputs[i] + "." + j + ">" + params[j] + "</" + inputs[i] + "." + j + ">\n";
                        }
                        //paramStr = paramStr + "<"+inputs[i]+" mult=true >\n"+paramList+"</"+inputs[i]+">\n";
                        paramStr = paramStr + "<" + inputs[i] + " >\n" + paramList + "</" + inputs[i] + ">\n";
                        //}else{
                        //paramStr = paramStr + "<"+inputs[i]+" mult=false >"+obk.value+"</"+inputs[i]+">\n";
                        //}
                    } else {
                        //paramStr = paramStr + "<"+inputs[i]+" >null</"+inputs[i]+">\n";
                        paramStr = paramStr + "<" + inputs[i] + "><" + inputs[i] + ".0>null</" + inputs[i] + ".0></" + inputs[i] + ">\n";
                    }
                }
                paramStr = paramStr + "</parameters>\n";
                //alert(paramStr);
                return paramStr;

            }

            function onRefreshInputs() {
                var cell = document.getElementById("editPanel2");
                if (cell.hasChildNodes()) {
                    while (cell.childNodes.length >= 1) {
                        cell.removeChild(cell.firstChild);
                    }
                }
                //var inputs = getFunctionParamList(txtBox.value);
                var inputs = getFunctionParamList(editAreaLoader.getValue("editArea"));

                //var m = myregx.exec(txtBox.value);
                //alert(inputs[1]);
                for (i = 0; i < inputs.length; i++) {
                    var oInputDivT = document.createElement('div');
                    var oInputDivI = document.createElement('div');
                    //oInputDivI.setAttribute('id','input'+inputs[i]);
                    oInputDivT.innerHTML = "<p>Value for parameter: " + inputs[i] + "</p>";
                    oInputDivI.innerHTML = '<textarea id="input' + inputs[i] + '"></textarea>';
                    document.getElementById('editPanel2').appendChild(oInputDivT);
                    document.getElementById('editPanel2').appendChild(oInputDivI);
                }
                var oButton3 = new YAHOO.widget.Button({
                    id: "btn_4",
                    type: "button",
                    label: "Refresh",
                    container: "editPanel2",
                    onclick: {
                        fn: onRefreshInputs
                    }
                });
            } //onrefreshinputs
            function onValidate() {

                removeElementById("tmp_script");
                var oHead = document.getElementsByTagName('HEAD').item(0);
                var oScript = document.createElement('script');
                oScript.setAttribute('id', 'tmp_script');
                oScript.type = "text/javascript";
                //oScript.text = txtBox.value;
                oScript.text = editAreaLoader.getValue("editArea");
                oHead.appendChild(oScript);
                //var inputs = getFunctionParamList(txtBox.value);
                var inputs = getFunctionParamList(editAreaLoader.getValue("editArea"));

                var params = [];
                var paramStr = "(";
                var regx = /[\D+]/;
                for (i = 0; i < inputs.length; i++) {
                    var obk = document.getElementById("input" + inputs[i]);
                    if (obk.value) {
                        if (obk.value.match(regx)) {
                            params[i] = obk.value;
                        } else {
                            params[i] = parseInt(obk.value);
                        }
                        paramStr = paramStr + obk.value + ",";
                    } else {
                        params[i] = null;
                        paramStr = paramStr + "null,";
                    }
                }
                paramStr = paramStr.substr(0, paramStr.length - 1);
                paramStr = paramStr + ")";

                debug("tab2.bottom", "Validating weevil_main" + paramStr);
                var result;
                try {
                    result = window["weevil_main"].apply(this, params);
                } catch(err) {
                    debug("tab2.bottom", "Validation Error: " + err.message);
                    result = null;
                }
                if (result != null) {
                    debug("tab2.bottom", "Result:" + result);
                    debug("tab2.bottom", "Validation OK");
                }

            }
        }

        function loadTab2Left() {
            var oDiv = new YAHOO.util.Element('tab2.left', {
                id: 'editNavPanel',
            });
            Dom.setStyle('editNavPanel', 'width', '100%');
            Dom.setStyle('editNavPanel', 'height', '100%');
            Dom.setStyle('editNavPanel', 'padding', '2px');
        }

        Event.onAvailable("editNavPanel", function() {
            tree = new YAHOO.widget.TreeView("editNavPanel");
            var xmlRes = getWeevilList();
            var weevilList = xmlRes.getElementsByTagName("weevil");
            for (i = 0; i < weevilList.length; i++) {
                //var divStr = '\<div id=id-'+weevilList[i].childNodes[0].nodeValue+'\>'+weevilList[i].childNodes[0].nodeValue+'\</div\>';
                var tmpNode = new YAHOO.widget.MenuNode(weevilList[i].childNodes[0].nodeValue, tree.getRoot(), false);
                //YAHOO.util.Event.addListener(tmpNode, "click", testClick);
            }
            tree.subscribe("labelClick", function(node) {
                //alert(node.label + " label was clicked");
                var oGetScript = GetHttpRequest();
                oGetScript.open('GET', "weevils/" + node.label + "/" + node.label + ".js", true);
                oGetScript.onreadystatechange = function() {
                    if (oGetScript.readyState != 4) {
                        return;
                    }
                    editAreaLoader.setValue('editArea', oGetScript.responseText);
                };
                oGetScript.send(null);
            });

            tree.draw();
        });
        Event.onAvailable('tab1.center', function() {
            var oCenter = document.getElementById('tab1.center');
            var gMapEl = document.createElement('div');
            gMapEl.setAttribute('id', 'content');
            gMapEl.setAttribute('class', 'googlemap');
            oCenter.appendChild(gMapEl);

            joinWeevilNetwork();

        });
        Event.onAvailable('tab1.left', function() {
            //var oDiv = new YAHOO.util.Element('tab1.left', {
            //	id: 'nav.left'
            //});
        });

        layout.render();
        Event.on(window, 'resize', layout.resize, layout, true);
	}//else

    }); //onDOMReady
})();

function onJoinBtnClick() {

    var pn = document.getElementById('joinBtn').parentNode;
    if (pn.hasChildNodes()) {
        while (pn.childNodes.length >= 1) {
            pn.removeChild(pn.firstChild);
        }
    }
    var oCenterChild = document.createElement('div');
    oCenterChild.id = "centerChild";
    oCenterChild.style.height = "100%";
    oCenterChild.style.width = "100%";
    pn.appendChild(oCenterChild);

    var tabDemo = new YAHOO.widget.TabView("centerChild");

    tabDemo.addTab(new YAHOO.widget.Tab({
        label: 'Weevil Network',
        content: '<div id="wnetwork"><div id="tab1.center"/><div id="tab1.left"/><div id="tab1.bottom"/></div>',
        active: true
    }));

    tabDemo.addTab(new YAHOO.widget.Tab({
        label: 'Submit a Weevil',
        id: 'mainTab2',
        content: '<div id="wedit"><div id="tab2.center"/><div id="tab2.left"/><div id="tab2.bottom"/></div>',
        //active: true	
    }));

    tabDemo.addTab(new YAHOO.widget.Tab({
        label: 'My Weevils',
        content: '<div id="myweevils"><div id="tab3.center" style="overflow:auto;height:100%;width:100%"/><div id="tab3.left"/><div id="tab3.bottom"/></div>'
    }));
    var cw = Dom.get('centerChild').offsetWidth - 20;
    var ch = Dom.get('centerChild').offsetHeight - Dom.get('centerChild').firstChild.offsetHeight - 10;
    Dom.setStyle('tab3.center', 'width', cw + 'px');
    Dom.setStyle('tab3.center', 'height', ch + 'px');

    tabDemo.addTab(new YAHOO.widget.Tab({
        label: 'Quick How To',
        content: '<iframe id="tab4.center" src="http://elab.lab.uvalight.net/~weevil/help/weevilhelp.html"></iframe>'
    }));
    Dom.setStyle('tab4.center', 'width', cw + 'px');
    Dom.setStyle('tab4.center', 'height', ch + 'px');

}
