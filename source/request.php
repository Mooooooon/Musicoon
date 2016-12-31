<?php

require 'HyperSearch.php';

header("Content-Type: application/json; charset=UTF-8");

$hyper_search = new HyperSearch();
echo $hyper_search->get_request();
exit();
