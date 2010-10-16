<?php

    /**********************/
    /***GET VISITOR INFO***/
    /**********************/

    if(isset($_SERVER['REMOTE_ADDR'])) {
        $clientIP = $_SERVER['REMOTE_ADDR'];    
    }else {
        $clientIP = "";
    }

    if(isset($_SERVER['REQUEST_URI'])) {
        $pageVisited = preg_replace("/^" . HOTLINKS_APP_PATH . "/", "", $_SERVER['REQUEST_URI']);
    }else {
        $pageVisited = "";
    }

    if(isset($_SERVER['HTTP_REFERER'])) {
        $referringSite = $_SERVER['HTTP_REFERER'];
    }else {
        $referringSite = "";
    }


    /**********************************/
    /***STORE VISITOR INFO IN THE DB***/
    /**********************************/

    if($clientIP && $pageVisited) {
        $db = new SQLite3(HOTLINKS_DB_PATH . "hotlinks.db.sqlite");
        $db->exec("INSERT INTO visits (client_ip, page_visited, referring_site, timestamp) VALUES('" . $clientIP . "', '" . $pageVisited . "', '" . $referringSite . "', current_timestamp)");
    }
?>
