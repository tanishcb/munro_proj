<?php
	include('connect.php');
	$query = "SELECT distinct(type) FROM munro_landuse order by type";
	$result = pg_query($db,$query);
	
		while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) 
		{
			foreach ($line as $col_value) 
			{
				echo "<option value='$col_value'>$col_value</option>";
				
			}
		}
?>