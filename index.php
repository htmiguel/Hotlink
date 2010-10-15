<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
        <meta name="description" content="Hotlinks - Realtime web statistics" />
        <title>Hotlinks - Realtime web statistics</title>
        <link rel="stylesheet" href="includes/style/style.css" type="text/css" media="screen" />
        <script src='includes/scripts/index.js'></script>
        <script src='includes/scripts/kodiak.js'></script>
    </head>
    <body>
        <div id="divMainWrapper">
            <div id="divTopBar">
                <div>Today</div>
                <div>This Week</div>
                <div>This Month</div>
                <div>This Year</div>
                <div>All</div>
            </div>
            <select id="cmbStatType">
                <option value="traffic" selected="selected">&nbsp;Traffic</option>
                <option value="topReferring">&nbsp;Top Referring Sites</option>
            </select>
            <div id="divGrid"></div>
        </div>
    </body>
</html>
