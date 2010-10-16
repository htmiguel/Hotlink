<?php
    if(isset($_REQUEST['dateRange'])) {
        $dateRange = $_REQUEST['dateRange'];
    }else {
        return false;
    }

    if(isset($_REQUEST['statType'])) {
        $statType = $_REQUEST['statType'];
        if($statType != "page_visited" && $statType != "referring_site") {
            return false;
        }
    }else {
        return false;
    }

    require_once("../config.php");

    switch($dateRange) {
        case "today":
            $where = " WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', current_timestamp)";
        break;
        case "week":
            $where = " WHERE strftime('%Y-%W', timestamp) = strftime('%Y-%W', current_timestamp)";
        break;
        case "month":
            $where = " WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', current_timestamp)";
        break;
        case "year":
            $where = " WHERE strftime('%Y', timestamp) = strftime('%Y', current_timestamp)";
        break;
        case "all":
            $where = "";
        break;
        default:
            return false;
        break;
    }

    $db = new SQLite3(HOTLINKS_DB_PATH . "hotlinks.db.sqlite");

    $sql = "SELECT unique_visitors." . $statType . " AS page, unique_visits, total_visits
            FROM (SELECT " . $statType . ", COUNT(client_ip) AS unique_visits FROM (SELECT " . $statType . ", client_ip FROM visits" . $where . " GROUP BY " . $statType . ", client_ip) GROUP BY " . $statType . ") AS unique_visitors,
                 (SELECT " . $statType . ", COUNT(client_ip) AS total_visits FROM visits" . $where . " GROUP BY " . $statType . ") AS total_visitors
            WHERE unique_visitors." . $statType . " = total_visitors." . $statType . "";

    $result = $db->query($sql);

    $resultArr = getAllRows($result);
    $uniqueTotal = 0;
    $visitTotal = 0;
    foreach($resultArr as $key => $val) {
        $uniqueTotal += $val['unique_visits'];
        $visitTotal += $val['total_visits'];
    }
    array_push($resultArr, array("page" => "<b>TOTAL:</b>", "unique_visits" => "<b>" . $uniqueTotal . "</b>", "total_visits" => "<b>" . $visitTotal . "</b>"));

    echo json_encode($resultArr);
    
    function getAllRows($result) {
        $resultArr = array();
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            array_push($resultArr, $row);
        }
        return $resultArr;        
    }
?>
