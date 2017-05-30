<?php
require_once 'Meting.php';
//ini_set('display_errors',1);
//Initialize
use Metowolf\Meting;
$api = new Meting('netease');
// Get data
   $result0 = $api->format(true)->playlist('122732544');
   $result1 = $api->format(true)->playlist('390243194');
   $result2 = $api->format(true)->playlist('397308456');
   $result3 = $api->format(true)->playlist('400592595');
//return JSON, just use it
$data0=json_decode($result0, true);
$data1=json_decode($result1, true);
$data2=json_decode($result2, true);
$data3=json_decode($result3, true);
$data=array_merge($data0, $data1, $data2, $data3);
rsort($data);

header('Content-type: application/json; charset=UTF-8');
echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);

