<?php
	ob_start('ob_gzhandler');
	
	$dbconn = pg_connect("host=127.0.0.1 dbname=webgis user=aifire password=caritausendiri")
		or die('Could not connect: ' . pg_last_error());
	
    $query = "SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(feature)
        )
        FROM (
            SELECT jsonb_build_object(
                'type',       'Feature',
                'id',         rid,
                'geometry',   ST_AsGeoJSON(coord)::jsonb,
                'properties', to_jsonb(row) - 'rid' - 'coord'
            ) AS feature
            FROM (SELECT rid,coord FROM rekomendasi WHERE epoch_time> now() - INTERVAL '8 days') row
        ) features;";
		
	$params = array();
	
	// Performing SQL query
	$result = pg_query_params($dbconn, $query, $params) or die('Query failed: ' . pg_last_error());
	while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
		foreach ($line as $gjson) {
			echo $gjson;
		}
	}
	pg_free_result($result);
	pg_close($dbconn);
?>
