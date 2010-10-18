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
    defaultDateRangeIndex = 0,
    defaultStatType       = "page_visited",
    updateInterval        = 30,
    refreshTimer;

window.onload = function(){
    var divDateButtons = $('divTopBar').getElementsByTagName('div'),
        cmbStatType = $('cmbStatType'),
        lblUniqueTotal = $('lblUniqueTotal'),
        lblVisitTotal = $('lblVisitTotal'),
        n,
        curDateRangeIndex,
        dataset,
        grid;

    for(n=0; n<divDateButtons.length; n++) {
        divDateButtons[n].onmousedown = _clickDateButton(n);
    }
    cmbStatType.onchange = function() {clickDateButton(curDateRangeIndex);};

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
            up: {x: 0, y: -14},
            down: {x: 0, y: 0}
        },
        columns: {
            Page: {
                dataField: 'page',
                sortable: true,
                width: 557,
                renderFn: function(data) {
                    var href;
                    if(data.val.page.match(/^http/)) {
                        href = "";
                    }else {
                        href = appPath;
                    }
                    href += data.val.page;

                    return "<a href='" + href + "'>" + data.val.page + "</a>";
                }
            },
            Unique: {
                title: 'Unique Visitors',
                align: 'right',
                dataField: 'unique_visits',
                sortable: true,
                width: 180
            },
            Total: {
                title: 'Total Visits',
                align: 'right',
                dataField: 'total_visits',
                sortable: true,
                width: 140
            }
        }
    });

    dataset.sort({field: 'unique_visits', dir: 'DESC'});

    cmbStatType.value = defaultStatType;
    clickDateButton(defaultDateRangeIndex);

    function getStats(n) {
         ajax.request({
            url:    'api/stats.php',
            method: 'post',
            parameters: {
                dateRange: dateHash[n],
                statType: cmbStatType.value
            },
            handler: getStatsHandler
        });    
    }

    function getStatsHandler(obj) {
        if(obj.success) {
            var result = eval('(' + obj.response + ')');

            dataset.setData({
                data: result.data,
                sortObj: {}
            });

            lblUniqueTotal.innerHTML = result.unique_total;
            lblVisitTotal.innerHTML = result.visit_total;
        }else {
            alert("There was an error retreiving stats.  Please try again later.");
        }
    }

    function clickDateButton(n) {
        var activeClass = 'clsActiveDateBtn';
        for(m=0; m<divDateButtons.length; m++) {
            if(m == n) {
                addClass(divDateButtons[m], activeClass);
            }else {
                removeClass(divDateButtons[m], activeClass);
            }
        }
        curDateRangeIndex = n;
        getStats(n);
        clearInterval(refreshTimer);
        refreshTimer = setInterval(function() {getStats(n);}, (updateInterval * 1000));
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
