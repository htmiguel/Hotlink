<?php
    if(isset($_REQUEST['dateRange'])) {
        $dateRange = $_REQUEST['dateRange'];
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

    $db = new SQLite3(DB_PATH . "hotlinks.db.sqlite");

    $sql = "SELECT unique_visitors.page_visited AS page, unique_visits AS uniqueVisitors, total_visits AS totalVisitors
            FROM (SELECT page_visited, COUNT(client_ip) AS unique_visits FROM (SELECT page_visited, client_ip FROM visits" . $where . " GROUP BY page_visited, client_ip) GROUP BY page_visited) AS unique_visitors,
                 (SELECT page_visited, COUNT(client_ip) AS total_visits FROM visits" . $where . " GROUP BY page_visited) AS total_visitors
            WHERE unique_visitors.page_visited = total_visitors.page_visited";

    $result = $db->query($sql);



    echo json_encode(getAllRows($result));
    
    function getAllRows($result) {
        $resultArr = array();
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            array_push($resultArr, $row);
        }
        return $resultArr;        
    }
?>
