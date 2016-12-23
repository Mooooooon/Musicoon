<?php

require 'CryptoCloudMusic.php';


class CloudMusicAPI extends CryptoCloudMusic
{

    public function __construct()
    {
        parent::__construct();
    }

    public function get_search($s, $limit = 20, $offset = 0, $type = 1)
    {
        $url = 'http://music.163.com/weapi/cloudsearch/get/web';
        $data = [
            's' => $s,
            'type' => $type,
            'limit' => $limit,
            'offset' => $offset,
            'total' => true,
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string|array $song_ids
     * @param int $br
     * @return mixed
     */
    public function get_url($song_ids, $br = 999000)
    {
        $ids = is_array($song_ids) ? $song_ids : [$song_ids];
        $url = 'http://music.163.com/weapi/song/enhance/player/url';
        $data = [
            'br' => $br,
            'ids' => $ids,
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string|array $song_ids
     * @return mixed
     */
    public function get_detail($song_ids)
    {
        $ids = is_array($song_ids) ? $song_ids : [$song_ids];
        $url = 'http://music.163.com/weapi/v3/song/detail';
        $buffer = [];
        foreach ($ids as $song_id) {
            $buffer[] = [
                'id' => $song_id,
            ];
        }
        $data = [
            'c' => json_encode($buffer),
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $artist_id
     * @return mixed
     */
    public function get_artist($artist_id)
    {
        $url = 'http://music.163.com/weapi/v1/artist/' . $artist_id;
        $data = [
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $album_id
     * @return mixed
     */
    public function get_album($album_id)
    {
        $url = 'http://music.163.com/weapi/v1/album/' . $album_id;
        $data = [
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $playlist_id
     * @return mixed
     */
    public function get_playlist($playlist_id)
    {
        $url = 'http://music.163.com/weapi/v3/playlist/detail';
        $data = [
            'id' => $playlist_id,
            'n' => 1000,
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $song_id
     * @return mixed
     */
    public function get_lyric($song_id)
    {
        $url = 'http://music.163.com/weapi/song/lyric';
        $data = [
            'id' => $song_id,
            'os' => 'pc',
            'lv' => '-1',
            'kv' => '-1',
            'tv' => '-1',
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $mv_id
     * @return mixed
     */
    public function get_mv($mv_id)
    {
        $url = 'http://music.163.com/weapi/mv/detail';
        $data = [
            'id' => $mv_id,
            'csrf_token' => null,
        ];
        return $this->curl($url, $this->create_encrypt_data($data));
    }

    /**
     * @param int|string $pic_id
     * @return string
     */
    public function get_cover($pic_id)
    {
        return 'http://p4.music.126.net/' . $this->pic_id_to_url($pic_id) . '/' . $pic_id . '.jpg';
    }


    /**
     * Encrypt picture
     * Require 64-bit support if pass on `int`!!!
     *
     * @param int|string $pic_id
     * @return string
     */
    protected function pic_id_to_url($pic_id)
    {
        $byte1[] = $this->str_to_arr('3go8&$8*3*3h0k(2)2');
        $byte2[] = $this->str_to_arr((string) $pic_id);
        $magic = $byte1[0];
        $song_id = $byte2[0];
        for ($i = 0; $i < count($song_id); $i++) {
            $song_id[$i] = $song_id[$i] ^ $magic[$i % count($magic)];
        }
        $result = base64_encode(md5($this->arr_to_str($song_id), 1));
        $result = str_replace('/', '_', $result);
        $result = str_replace('+', '-', $result);
        return $result;
    }

    protected function str_to_arr($string)
    {
        $bytes = [];
        for ($i = 0; $i < strlen($string); $i++) {
            $bytes[] = ord($string[$i]);
        }
        return $bytes;
    }

    protected function arr_to_str($bytes)
    {
        $str = '';
        for ($i = 0; $i < count($bytes); $i++) {
            $str .= chr($bytes[$i]);
        }
        return $str;
    }

}
