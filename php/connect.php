<?php
   $host        = "host=localhost";
   $port        = "port=5432";
   $dbname      = "dbname=munro";
   $credentials = "user=postgres password=postgres";
   $db = pg_connect( "$host $port $dbname $credentials");

    if(!$db){
      echo "Error : Unable to open database\n";
   } else {
      
   }
   
?>