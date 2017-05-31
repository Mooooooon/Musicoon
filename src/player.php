<?php
require_once 'Meting.php';
//ini_set('display_errors',1);
//Initialize
use Metowolf\Meting;
$api = new Meting('netease');

$id = $_GET["id"];
$detail = $api->format(true)->song($id);
$det_info = json_decode($detail, true);
$cover = $api->format(true)->pic($det_info[0]["pic_id"]);
$cov_info = json_decode($cover, true);
$mp3 = $api->format(true)->url($id);
$mp3_info = json_decode($mp3, true);
$lyric111 = $api->format(true)->lyric($id);
$lrc_info = json_decode($lyric111,true);

//处理音乐信息
$play_info["cover"] = $cov_info{"url"};
$play_info["music_name"] = $det_info[0]["name"];
$play_info["mp3"] = $mp3_info{"url"};
$play_info["mp3"] = str_replace('http://', 'https://', $play_info["mp3"]);
$play_info["mp3"] = str_replace('https://m8', 'https://m7', $play_info["mp3"]);
foreach ($det_info[0]["artist"] as $key) {
    if (!isset($play_info["artists"])) {
        $play_info["artists"] = $key;
    } else {
        $play_info["artists"] .= "," . $key;
    }	
}

if ($lrc_info["lyric"] != "") {
    $lrc = explode("\n", $lrc_info["lyric"]);
    array_pop($lrc);
    foreach ($lrc as $rows) {
        $row = explode("]", $rows);
        if (count($row) == 1) {
            $play_info["lrc"][0] = "no";
            break;
        } else {
            $lyric = array();
            $col_text = end($row);
            array_pop($row);
            foreach ($row as $key) {
                $time1 = explode(":", substr($key, 1));
                $time1 = $time1[0] * 60 +  $time1[1];
                $play_info["lrc"][$time1] = $col_text;
            }
        }
    }
} else {
    $time = "0";
    $play_info["lrc"][0] = "No Lyrics / 很抱歉，這首曲子暫無歌詞";
}
//翻译的歌词
if ($lrc_info["tlyric"] != "") {
    $tlrc = explode("\n", $lrc_info["tlyric"]);
    array_pop($tlrc);
    foreach ($tlrc as $rows) {
        $row = explode("]", $rows);
       if (count($row) == 1) {
            $play_info["tlrc"][0] = "no";
            break;
        } else {
            $lyric = array();
            $col_text = end($row);
            array_pop($row);
            foreach ($row as $key) {
                $time = explode(":", substr($key, 1));
                $time = $time[0] * 60 + $time[1];
                $play_info["tlrc"][$time] = $col_text;
            }
        }
    }
} else {
    $play_info["tlrc"][0] = "";
}

$play_info["id"] = $id;

header('Content-type: application/json; charset=UTF-8');
echo json_encode($play_info,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
