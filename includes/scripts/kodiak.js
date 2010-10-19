//*********************************************************************************
//Ajax class: Used for posting ajax transactions.**********************************
//*********************************************************************************

Kodiak.Data.Ajax = function() {
    this._getXMLHttpRequest();
};

Kodiak.Data.Ajax.prototype = {
    _http_request: false,
    
    request: function(obj) {
        var _this = this, params;
        
        obj.method = obj.method.toLowerCase();
        this._http_request.onreadystatechange = function() {_this._handleResponse(obj.handler);};
        obj.parameters = this._objToPostStr(obj.parameters);
        
        if(obj.method == 'get' && obj.parameters) {
            obj.url += "?" + obj.parameters;
        }    
        
        this._http_request.open(obj.method, obj.url, true);
        
        if(obj.method == 'post') {
            params = obj.parameters;
            this._http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            this._http_request.setRequestHeader("Content-length", obj.parameters.length);
            this._http_request.setRequestHeader("Connection", "close");
        }

        this._http_request.send(params);
    },
    
    submitForm: function(obj) {
        var formFields = obj.form.elements,
            postObj = {},
            field;

        for(field in formFields) {
            if(formFields[field].name && formFields[field].value) {
                postObj[formFields[field].name] = encodeURI(formFields[field].value);
            }
        }
        this.request({url: obj.url, method: obj.method, parameters: postObj, handler: obj.handler});
    },

    _getXMLHttpRequest: function() {
        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            this._http_request = new XMLHttpRequest();
            if (this._http_request.overrideMimeType) {
                this._http_request.overrideMimeType('text/html');
            }
        } else if (window.ActiveXObject) { // IE
            try {
                this._http_request = new ActiveXObject("Msxml2.XMLHTTP");
            }catch(e) {
                this._http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        if (!this._http_request) {
            return false;
        }
    },
    
    _objToPostStr: function(obj) {
        if(typeof(obj) == 'object') {
            var postStr = "",
                prop;
            for(prop in obj) {
                if(obj[prop]) {
                    postStr += prop + "=" + escape(obj[prop]) + "&";
                }
            }
            postStr = postStr.replace(/\&$/, '');
            return postStr;
        }else {
            return obj;
        }
    },

    _handleResponse: function(handler) {
        if (this._http_request.readyState == 4) {
            if (this._http_request.status == 200) {
                handler({success: true, response: this._http_request.responseText});
            }else {
                handler({success: false});
            }
        }
    }
};


//*********************************************************************************
//Dataset class: Sets up a sortable 2d data array.*********************************
//*********************************************************************************

Kodiak.Data.Dataset = function(data) {
    this.updateListener = new Kodiak.Util.Listener();
    this.selectListener = new Kodiak.Util.Listener();

    this.sortCol = [];

    if(data) {
        this.setData(data);
    }
};

Kodiak.Data.Dataset.prototype = {
    data: [],
    
    setData: function(config) {
        var util = new Kodiak.Util();
        this.data = [];
        this.alwaysOnTop = {};

        util.clone(config.data, this.data);

        if(config.alwaysOnTop) {
            util.clone(config.alwaysOnTop, this.alwaysOnTop);
        }

        if(config.sortObj) {
            this.sort(config.sortObj);
        }else {
            this.sortCol = [];
            this.updateListener.fire();
        }
    },
    
    sort: function(params) {
        if(!params) {
            params = {};
        }
        var _this = this,
            field = params.field,
            dir = params.dir;

        if(!field && !dir) {
            if(this.sortCol.length) {
                field = this.sortCol[0];
                dir = this.sortCol[1];
            }else {
                field = this.getColumns()[0];
                dir = "ASC";
            }
        }else if(field && dir == "toggle") {
            if(field == this.sortCol[0]) {
                dir = (this.sortCol[1] == "ASC") ? dir = "DESC" : dir = "ASC";
            }else {
                dir = "ASC";
            }
        }

        this.data.sort(function(a, b){
            var n = 0,
                sortVal,
                sortArr = [],
                sortFieldArr = field.split('.'),
                m,
                prop;

            if(dir == "DESC") {
                n = 2;
            }

            sortArr[0] = a[sortFieldArr[0]];
            for(m=1; m<sortFieldArr.length; m++) {
                sortArr[0] = sortArr[0][sortFieldArr[m]];
            }
            if(typeof(a[field]) == 'string') {
                sortArr[0] = sortArr[0].toLowerCase();
            }

            sortArr[1] = b[sortFieldArr[0]];
            for(m=1; m<sortFieldArr.length; m++) {
                sortArr[1] = sortArr[1][sortFieldArr[m]];
            }
            if(typeof(b[field]) == 'string') {
                sortArr[1] = sortArr[1].toLowerCase();
            }

            if(_this.alwaysOnTop) {
                for(prop in _this.alwaysOnTop) {
                    if(a[prop] == _this.alwaysOnTop[prop] && b[prop] == _this.alwaysOnTop[prop]) {
                        sortVal = ((sortArr[0] < sortArr[1]) ? (-1+n) : (sortArr[0] > sortArr[1]) ? (1-n) : 0);                    
                    }else if(a[prop] == _this.alwaysOnTop[prop]) {
                        sortVal = -1;
                        break;
                    }else if(b[prop] == _this.alwaysOnTop[prop]) {
                        sortVal = 1;
                        break;
                    }
                }
            }

            if(!sortVal) {
                sortVal = ((sortArr[0] < sortArr[1]) ? (-1+n) : (sortArr[0] > sortArr[1]) ? (1-n) : 0);
            }
            return sortVal;
        });
        
        this.sortCol = [field, dir];
        this.updateListener.fire();
    },
    
    getColumns: function() {
        var colArr = [],
            headerCol = this.data[0],
            prop;

        for(prop in headerCol) {
            if(headerCol[prop]) {
                colArr.push(prop);
            }
        }
        return colArr;
    },
    
    getRowCount: function() {
        return this.data.length;
    },
    
    getRow: function(num) {
        return this.data[num];
    },
    
    getSelected: function() {
        var selectedArr = [],
            rowSelected,
            rowCount = this.getRowCount(),
            n;

        for(n=0; n<rowCount; n++) {
            rowSelected = this.rowSelected(n, '', true);
            if(rowSelected) {
                selectedArr.push({index: n, data: this.getRow(n)});
            }
        }
        return selectedArr;
    },
    
    getSelectedRowCount: function() {
        var rowSelected,
            selectedRowCount = 0,
            rowCount = this.getRowCount(),
            n = 0;

        for(n=0; n<rowCount; n++) {
            rowSelected = this.rowSelected(n, '', true);
            if(rowSelected) {
                selectedRowCount++;
            }
        }
        return selectedRowCount;
    },
    
    selectAllRows: function(state, skipUpdate) {
        var n;
        for(n=0; n<this.getRowCount(); n++) {
            this.rowSelected(n, state, true);
        }
        if(!skipUpdate) {
            this.selectListener.fire();
        }
    },
    
    rowSelected: function(rNum, state, skipUpdate) {
        if(state !== true && state !== false) {
            return this.getRow(rNum)._rowSelected;
        }else {
            this.getRow(rNum)._rowSelected = state;
        }
        if(!skipUpdate) {
            this.selectListener.fire();
        }
    }
};

//*********************************************************************************
//Util class: Contains an assortment of utility methods.***************************
//*********************************************************************************

Kodiak.Util = function() {};

Kodiak.Util.prototype = {
    printObj: function(obj) {
        var propTable = "",
            prop;
        
        propTable += "<table>";
        for(prop in obj) {
            if(obj[prop]) {
                propTable +='<tr><td>' + prop + ':&nbsp;&nbsp</td><td>';
                if(typeof(obj[prop]) == 'object') {
                    propTable += this.printObj(obj[prop]);
                }else {
                    propTable += obj[prop];
                }
                propTable +='</td></td>';
            }
        }
        propTable += '</table>';
        return propTable;
    },

    toEl: function(n) {
        if(typeof(n) == 'string') {
            return document.getElementById(n);
        }else {
            return n;
        }
    },
    
    clone: function(from, to, skip) {
        var prop;
        if(!skip) {
            skip = {};  //skip obj used for specifying properties to skip or no recurse into. use values 'skip' and 'norecurse', respectively.
        }
        for(prop in from) {
            if(skip[prop] != 'skip') {
                if(typeof(from[prop]) == 'object' && skip[prop] != 'norecurse') {
                    if(from[prop].constructor == Array.prototype.constructor) {
                        to[prop] = [];
                    }else {
                        to[prop] = {};
                    }
                    this.clone(from[prop], to[prop], skip);
                }else {
                    to[prop] = from[prop];
                }
            }
        }
    },
    
    getTargID: function(event) {
        if(typeof(event) == "object") {
            var targ;
            if(event.target) {
                targ = event.target;
            }else if(event.srcElement) {
                targ = event.srcElement;
            }
            if (targ.nodeType == 3) {
                targ = targ.parentNode;
            }
            return targ.id;
        }else {
            return false;
        }
    },
    
    //getRadioVal
    //Desc:  gets the value of a radio button series which is wrapped in element el
    //Args:  el: parent element of radio elements.
    getRadioVal: function(el) {
        var n;
        el = this.toEl(el);
        el = el.getElementsByTagName('input');
        for(n=0; n<el.length; n++) {
            if(el[n].type == 'radio' && el[n].checked) {
                return el[n].value;
            }
        }
    }
};

Kodiak.Util.Listener = function() {
    this.eventStack = [];
};

Kodiak.Util.Listener.prototype = {
    add: function(fn) {
        this.eventStack.push(fn);
    },
    
    clear: function() {
        this.eventStack = [];
    },
    
    fire: function() {
        var n;
        for(n=0; n<this.eventStack.length; n++) {
            this.eventStack[n]();
        }
    }
};


//*********************************************************************************
//Table class: Defines a table*****************************************************
//*********************************************************************************

Kodiak.Controls.Table = function(config) {
    var _this = this;
    this.util = new Kodiak.Util();
    this.util.clone(config, this, {data: 'norecurse', applyTo: 'norecurse'});

    Kodiak.Components[this.componentId] = this;
    
    if(this.applyTo) {
        this.applyTo = this.util.toEl(this.applyTo);
    }else {
        alert("table: 'applyTo' property not defined.  Check documentation.");
        return;
    }

    this.renderTable();

    this.data.updateListener.add(function() {_this._setSortArrow();});
    this.data.updateListener.add(function() {_this.renderData();});
    this.data.selectListener.add(function() {_this.renderData();});
};

Kodiak.Controls.Table.prototype = {
    _tableRendered: false,
    
    renderTable: function(force) {
        if((!this._tableRendered || force === true)) {
            var prop,
                col,
                title,
                divHeaderStyle,
                tableStr = "" +
                "<table id='" + this.tableDomId + "'><thead><tr>";
                    for(prop in this.columns) {
                        if(this.columns[prop]) {
                            col = this.columns[prop];
                            if(!col.align) {
                                col.align = 'left';
                            }
                            tableStr += "" +
                            "<th style='width: " + col.width + "px; text-align: " + col.align + ";'>";
                            if(col.title) {
                                title = col.title;
                            }else {
                                title = prop;
                            }
                            if(col.sortable) {
                                if(col.align == 'center') {
                                    divHeaderStyle = "margin: 0 auto;"; //fix. div width needs to be set somehow so that header div can be centered.
                                }else {
                                    divHeaderStyle = "float: " + col.align;
                                }
                                tableStr += "" +
                                "<div style='overflow: hidden; " + divHeaderStyle + ";'><div style='float: left; cursor: pointer;'>" + title + "</div>";
                                if(this.sortArrow) {
                                    tableStr += "" +
                                    "<div style='float: left; display: none; cursor: pointer; margin-left: 1px; width: " + this.sortArrow.size.width + "px; height: " + this.sortArrow.size.width + "px; background-image: url(" + this.sortArrow.img + ");'></div>";
                                }
                                tableStr+= "" +
                                "</div></th>";
                            }else {
                                tableStr += title;
                            }
                        }
                    }
                    tableStr += "" +
                    "</tr></thead>" +
                "</table><div id='" + this.tableDomId + "_tBodyContents' style='display: none; width: 0px; height: 0px;'></div>";
                
            this.applyTo.innerHTML = tableStr;
            this._tableRendered = true;
        }
    },
    
    _setSortArrow: function() {    
        var n=0,
            col,
            node,
            dir = {DESC: 'up', ASC: 'down'},
            sortableCols = this.applyTo.getElementsByTagName('th'),
            prop,
            m;

        for(prop in this.columns) {
            if(this.columns[prop]) {
                col = this.columns[prop];
                node = sortableCols[n].childNodes[0];
                if(col.sortable && col.dataField) {
                    for(m=0; m<node.childNodes.length; m++) {
                        node.childNodes[m].onclick = this._makeSortFn(col.dataField);
                    }
                    node = node.childNodes[1].style;
                    if(col.dataField == this.data.sortCol[0]) {
                        node.display = "block";
                        node.backgroundPosition = this.sortArrow[dir[this.data.sortCol[1]]].x + 'px ' + this.sortArrow[dir[this.data.sortCol[1]]].y + 'px';
                    }else {
                        node.display = "none";
                    }
                }
                n++;
            }
        }
    },
    
    renderData: function() {
        var row,
            fieldData,
            prop,
            col,
            n,
            m,
            dataFieldArr,
            tableStr = "<table><tbody>",
            table,
            tableDiv;
        
        for(n=0; n<this.data.getRowCount(); n++) {
            row = this.data.getRow(n);
            tableStr += "<tr>";
            for(prop in this.columns) {
                if(this.columns[prop]) {
                    col = this.columns[prop];
                    if(col.dataField) {
                        dataFieldArr = col.dataField.split('.');
                        fieldData = row[dataFieldArr[0]];
                        for(m=1; m<dataFieldArr.length; m++) {
                            fieldData = fieldData[dataFieldArr[m]];
                        }
                    }else {
                        fieldData = "";
                    }
                    tableStr += "<td style='text-align: " + col.align + ";'>";
                    if(col.renderFn) {
                        tableStr += col.renderFn({val: row, index: n, scope: this});
                    }else if(col.selectRowCheckBox) {
                        tableStr += "<input type='checkbox' />";
                    }else {
                        tableStr += fieldData;
                    }
                    tableStr += "</td>";
                }
            }
            tableStr += "</tr>";
        }
        tableStr += "</tbody></table>";
        
        table = this.applyTo.childNodes[0];
        tableDiv = this.applyTo.childNodes[1];
        tableDiv.innerHTML = tableStr;

        if(table.childNodes.length > 1) {
            table.removeChild(table.childNodes[1]);
        }
        table.appendChild(tableDiv.firstChild.firstChild);

        this._setSelectedRows();
    },

    _setSelectedRows: function() {
        var tBody = this.applyTo.childNodes[0].childNodes[1],
            row,
            el,
            n,
            prop,
            col,
            colIndex;

        for(n=0; n<this.data.getRowCount(); n++) {
            row = tBody.childNodes[n];
            colIndex = 0;
            for(prop in this.columns) {
                if(this.columns[prop]) {
                    col = this.columns[prop];
                    if(col.selectRowCheckBox) {
                        el = row.childNodes[colIndex].childNodes[0];
                        if(this.data.rowSelected(n)) {
                            row.className += ' ' + this.rowSelectedClass;
                            el.checked = true;
                        }
                        el.onclick = this._makeSelectFn(el, n);
                    }
                    colIndex++;
                }
            }
        }
    },
    
    _selectRow: function(el, n) {
        var rowSelected;

        if(el.checked) {
            rowSelected = true;
        }else {
            rowSelected = false;
        }
        this.data.rowSelected(n, rowSelected);
    },

    _makeSelectFn: function(el, n) {
        var _this = this;
        return function() {
            _this._selectRow(el, n);
        };
    },
    
    _makeSortFn: function(field) {
        var _this = this;
        return function() {
            _this._sortFn(field);
        };
    },
    
    _sortFn: function(field) {
        this.data.sort({field: field, dir: 'toggle'});
    }
};
