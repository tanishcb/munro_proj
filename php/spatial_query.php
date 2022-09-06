<?php
	include('connect.php');

	$aname1 = $_GET["attrib_Name1"]; // EATTAPADAPPU BEAT
	//$aname1='WASTE LANDS';
	//echo "{name:'Tanish'}";
	
		//query1 ="SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM (SELECT 'Feature' As type , ST_AsGeoJSON(ST_AsText(ST_Transform(ST_GeomFromText(ST_AsText(geom),32643),900913)))::json As geometry ,". $fname ." As properties FROM ". $dname ." WHERE ". $fname ." Like '".$aname."') As f ) As fc";	
	$query1 ="SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM (SELECT 'Feature' As type , ST_AsGeoJSON(ST_AsText(ST_Transform(ST_GeomFromText(ST_AsText(geom),32643),4326)))::json As geometry  FROM munro_landuse WHERE type = '".$aname1."') As f ) As fc";
	//echo "{name:$query1}";
	$result = pg_query($query1);
	if (!$result) 
	{
		die("Error in SQL query: " . pg_last_error());

		
	}
	else
	{
		while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) 
		{
			foreach ($row as $col_value) 
			{
				$geometria = $col_value ;
				
			}
		}
		
		echo $geometria; 
	}
	
	
	
	
	
?>