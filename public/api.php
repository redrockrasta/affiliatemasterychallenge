<?php

$qry_str = "?week_id=". $_GET['week_id'] . "&day_id=". $_GET['day_id'] ."&page=" . $_GET['page'];
$ch = curl_init();

// Set query data here with the URL
curl_setopt($ch, CURLOPT_URL, 'http://dev.affiliatemasterychallenge.com/videos' . $qry_str);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, '3');
$content = trim(curl_exec($ch));
curl_close($ch);
print $content;
