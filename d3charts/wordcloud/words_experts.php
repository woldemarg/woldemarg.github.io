<?php
    $username = "admin_zenlix"; 
    $password = "YQ2t1uICx1";   
    $host = "localhost";
    $database="admin_zenlix";
    
    $server = mysql_connect($host, $username, $password);
    $connection = mysql_select_db($database, $server);
        
    //обязательный перевод кодировки https://habrahabr.ru/post/10983/
    mysql_query("SET NAMES 'utf8'");

    /*$myquery = "SELECT replace (replace (msg, '<br>', ''), char(10), '') as msg FROM tickets where msg not like '%file%'";*/
    
    //текст без переносов строк, тегов и ссылок на вложенные файлы
    $myquery = "SELECT replace (replace (comment_text, '<br>', ''), char(10), '') as msg FROM comments Where comment_text not like '%file%'";

    $query = mysql_query($myquery);
    
    if ( ! $query ) {
        echo mysql_error();
        die;
    }
    
    $data = array();
    
    for ($x = 0; $x < mysql_num_rows($query); $x++) {
        $data[] = mysql_fetch_assoc($query);
    }
    
    echo json_encode($data);

    mysql_close($server);
?>