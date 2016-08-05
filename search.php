<?php

// header("Access-Control-Allow-Headers: Cache-Control, Pragma, Expires");
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include_once "config.php";
include_once "functions.php";

$api = new MusicAPI();

global $song;
global $playlist;

foreach ($playlist as $key) {
    $json = $api->get_playlist_info($key);
    $arr = json_decode($json, true);
    foreach ($arr["result"]["tracks"] as $key2) {
        $id = $key2["id"];
        if (!in_array($id, $song)) {
            $song[] = $id;
        }
    }
}

function get_music_id()
{
    global $song;
    $sum = count($song);
    $id = $song[rand(0, $sum - 1)];
    return $id;
}

#获取数据
if (isset($_GET["id"])) {
    $id = $_GET["id"];
} else {
    $id = get_music_id();
    $play_info["ids"] = $song;
}

$music_info = json_decode($api->get_music_info($id), true);
$music_v2_info = json_decode($api->url($id), true);

#处理音乐信息
// $play_info["mp3"] = $music_info["songs"][0]["mp3Url"];
// $play_info["mp3"] = str_replace("http://m", "http://p", $play_info["mp3"]);
$play_info["mp3"] = $music_v2_info["data"][0]["url"];
$play_info["cover"] = $music_info["songs"][0]["album"]["picUrl"];
$play_info["title"] = $music_info["songs"][0]["name"];
foreach ($music_info["songs"][0]["artists"] as $key) {
    if (!isset($play_info["artists"])) {
        $play_info["artist"] = $key["name"];
    } else {
        $play_info["artist"] .= "," . $key["name"];
    }
}

if (isset($_GET["callback"])) {
    echo $_GET["callback"] . "(" . json_encode($play_info) . ")";
} else {
    echo json_encode($play_info);
}
