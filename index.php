<?php 
    require_once "config.php";
?>
<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
        <meta name="description" content="Hotlinks - Realtime web statistics" />
        <title>Hotlinks - Realtime web statistics</title>
        <link rel="stylesheet" href="includes/style/style.css" type="text/css" media="screen" />
        <script src='includes/scripts/index.js'></script>
        <script src='includes/scripts/kodiak.js'></script>
        <script type="text/javascript">
            var appPath = '<?php echo HOTLINKS_APP_PATH; ?>';
        </script>
    </head>
    <body>
        <div id="divMainWrapper">
            <div id="divTopBar">
                <div>Today</div>
                <div>This Week</div>
                <div>This Month</div>
                <div>This Year</div>
                <div>All</div>
                <div>Custom</div>
            </div>
            <select id="cmbStatType">
                <option value="page_visited" selected="selected">&nbsp;Traffic</option>
                <option value="referring_site">&nbsp;Top Referring Sites</option>
            </select>
            <div id="divGrid"></div>
            <div id="divStatusBar">
                <table>
                    <tr>
                        <td style="width: 558px;"><b>TOTAL</b></td>
                        <td style="width: 180px; text-align: right;"><b><label id="lblUniqueTotal"></label></b></td>
                        <td style="width: 140px; text-align: right;"><b><label id="lblVisitTotal"></label></b></td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
</html>
