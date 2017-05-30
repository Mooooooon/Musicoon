<?php
/**
 * Created by PhpStorm.
 * User: Moon
 * Date: 2014/11/25 0025
 * Time: 0:08
 */
include 'list.php';

function curl_get($url)
{
    $refer = "http://music.163.com/";
    $header[] = "Cookie: " . "appver=1.5.0.75771;";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
    curl_setopt($ch, CURLOPT_REFERER, $refer);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}

function get_playlist_info($playlist_id)
{
    $url = "http://music.163.com/api/playlist/detail?id=" . $playlist_id;
    return curl_get($url);
}

function get_music_info($music_id)
{
    $url = "http://music.163.com/api/song/detail/?id=" . $music_id . "&ids=%5B" . $music_id . "%5D";
    return curl_get($url);
}

function get_music_lyric($music_id)
{
    $url = "http://music.163.com/api/song/lyric?os=pc&id=" . $music_id . "&lv=-1&kv=-1&tv=-1";
    return curl_get($url);
}

function rand_music()
{
    global $player_list;
    $sum = count($player_list);
    $id = $player_list[rand(0, $sum - 1)];
    return $id;
}

function get_music_id()
{
    $played = isset($_COOKIE["played"]) ? json_decode($_COOKIE["played"]) : null;
    $id = rand_music();
    if ($played != null) {
        global $player_list;
        $sum = count($player_list);
        if ($sum >= 2) {
            $sum = $sum * 0.5;
        } else {
            $sum -= 1;
        }
        while (in_array($id, $played)) {
            $id = rand_music();
        }
        if (count($played) >= $sum) {
            array_shift($played);
        }
    }
    $played[] = $id;
    setcookie("played", json_encode($played), time() + 3600);
    return $id;
}

foreach ($playlist_list as $key) {
    $json = get_playlist_info($key);
    $arr = json_decode($json, true);
    foreach ($arr["result"]["tracks"] as $key2) {
        $id = $key2["id"];
        if (!in_array($id, $player_list)) {
            $player_list[] = $id;
        }
    }
}

//获取数据
$id = get_music_id();
$music_info = json_decode(get_music_info($id), true);
$lrc_info = json_decode(get_music_lyric($id), true);

//处理音乐信息
$play_info["cover"] = $music_info["songs"][0]["album"]["picUrl"];
$play_info["mp3"] = $music_info["songs"][0]["mp3Url"];
$play_info["mp3"] = str_replace("http://m", "http://p", $play_info["mp3"]);
$play_info["music_name"] = $music_info["songs"][0]["name"];
foreach ($music_info["songs"][0]["artists"] as $key) {
    if (!isset($play_info["artists"])) {
        $play_info["artists"] = $key["name"];
    } else {
        $play_info["artists"] .= "," . $key["name"];
    }
}

//处理歌词
if (isset($lrc_info["lrc"]["lyric"])) {
    $lrc = explode("\n", $lrc_info["lrc"]["lyric"]);
    array_pop($lrc);
    foreach ($lrc as $rows) {
        $row = explode("]", $rows);
        if (count($row) == 1) {
            $play_info["lrc"] = "no";
            break;
        } else {
            $lyric = array();
            $col_text = end($row);
            array_pop($row);
            foreach ($row as $key) {
                $time = explode(":", substr($key, 1));
                $time = $time[0] * 60 + $time[1];
                $play_info["lrc"][$time] = $col_text;
            }
        }
    }
} else {
    $play_info["lrc"] = "no";
}
echo json_encode($play_info);