var Kodiak = {
        Data: {},
        Util: {},
        Controls: {},
        Components: {}
    },
    dateHash = {
        0: "today",
        1: "week",
        2: "month",
        3: "year",
        4: "all"
    },
    defaultDateRange = 0,
    updateInterval   = 15000,
    refreshTimer;

window.onload = function(){
    var divDateButtons = $('divTopBar').getElementsByTagName('div'),
        n,
        dataset,
        grid;

    for(n=0; n<divDateButtons.length; n++) {
        divDateButtons[n].onmousedown = _clickDateButton(n);
    }
    
    ajax = new Kodiak.Data.Ajax();
    dataset = new Kodiak.Data.Dataset();
    grid = new Kodiak.Controls.Table({
        applyTo: 'divGrid',
        componentId: 'tblVisitors',
        tableDomId: 'tblVisitors',
        data: dataset,
        sortArrow: {
            img: 'includes/images/tblArrowSprite.png',
            size: {width: 14, height: 14},
            up: {x: 0, y: 0},
            down: {x: 0, y: -14}
        },
        columns: {
            Page: {
                dataField: 'page_visited',
                sortable: true,
                width: 390
            },
            Unique: {
                title: 'Unique Visitors',
                dataField: 'unique_visits',
                sortable: true,
                width: 250
            },
            Total: {
                title: 'Total Visits',
                dataField: 'total_visits',
                sortable: true,
                width: 250
            }
        }
    });

    dataset.sort({field: 'uniqueVisitors', dir: 'DESC'});

    clickDateButton(defaultDateRange);

    function getStats(n) {
         ajax.request({
            url:    'api/stats.php',
            method: 'post',
            parameters: {dateRange: dateHash[n]},
            handler: getStatsHandler
        });    
    }

    function getStatsHandler(obj) {
        if(obj.success) {
            var result = eval('(' + obj.response + ')');
            dataset.setData({
                data: result,
                alwaysOnBottom: {page_visited: '<b>TOTAL:</b>'},
                sortObj: {}
            });
        }else {
            alert("There was an error retreiving stats.  Please try again later.");
        }
    }

    function clickDateButton(n) {
        var activeClass = 'clsActiveDateBtn';
        if(!hasClass(divDateButtons[n], activeClass)) {
            for(m=0; m<divDateButtons.length; m++) {
                if(m == n) {
                    addClass(divDateButtons[m], activeClass);
                }else {
                    removeClass(divDateButtons[m], activeClass);
                }
            }
            getStats(n);
            clearInterval(refreshTimer);
            refreshTimer = setInterval(function() {getStats(n);}, updateInterval);
        }
    }

    function _clickDateButton(n) {
        return function() {
            clickDateButton(n);
            return false;
        }
    }


    /***UTIL FUNCTIONS***/

    function hasClass(ele,cls) {
        return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }

    function addClass(ele,cls, skip) {
        if(skip || !hasClass(ele,cls)) {
            ele.className += " " + cls;
        }
    }

    function removeClass(ele,cls, skip) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        if(skip || hasClass(ele,cls)) {
            ele.className=ele.className.replace(reg,' ');
        }
    }

    function $(el) {
        return document.getElementById(el);
    }
};
