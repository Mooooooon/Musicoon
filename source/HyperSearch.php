<?php

require 'CloudMusicAPI.php';


class HyperSearch
{

    const DONE_CODE = 200;
    const FAIL_CODE = 400;

    protected $API;
    protected $BR_CODE = 192000;


    public function __construct()
    {
        $this->API = new CloudMusicAPI();
    }

    /**
     * @param int|string|array $song_ids
     * @return mixed
     */
    protected function get_detail_limit($song_ids)
    {
        $data = [];
        $timestamp = time();
        $urls = json_decode($this->API->get_url($song_ids, $this->BR_CODE), true);
        $details = json_decode($this->API->get_detail($song_ids), true);
        $urls_code = isset($urls['code']) ? $urls['code'] : self::FAIL_CODE;
        $details_code = isset($details['code']) ? $details['code'] : self::FAIL_CODE;
        $code = self::FAIL_CODE;

        if ($urls_code == self::DONE_CODE && $details_code == self::DONE_CODE) {
            $code = self::DONE_CODE;
            foreach ($details['songs'] as $song) {
                $artists = [];
                $song_info = $this->get_song_info($urls['data'], $song['id']);
                if (!$song_info) {
                    continue;
                }
                foreach ($song['ar'] as $artist) {
                    $artists[] = $artist['name'];
                }
                $data[] = [
                    'id' => $song['id'],
                    'name' => $song['name'],
                    'album' => [
                        'pic' => $song['al']['pic'],
                        'name' => $song['al']['name'],
                        'picUrl' => $this->API->get_cover($song['al']['pic']),
                    ],
                    'artists' => implode('/', $artists),
                    'url' => $song_info['url'],
                    'md5' => $song_info['md5'],
                    'code' => $song_info['code'],
                    'expire' => $song_info['expi'],
                    'timestamp' => $timestamp,
                ];
            }
        }

        return json_encode([
            'code' => $code,
            'data' => $data,
        ]);
    }

    /**
     * Dirty Checkout
     *
     * @param array $data
     * @param int|string $song_id
     * @return null|object
     */
    protected function get_song_info($data, $song_id)
    {
        foreach ($data as $song) {
            if ($song['id'] == $song_id && $song['url']) {
                return $song;
            }
        }
        return null;
    }

    /**
     * @param int|string $artist_id
     * @return mixed
     */
    protected function get_artist_limit($artist_id)
    {
        $data = [];
        $raw = json_decode($this->API->get_artist($artist_id), true);
        $code = isset($raw['code']) ? $raw['code'] : self::FAIL_CODE;
        if ($code == self::DONE_CODE) {
            foreach ($raw['hotSongs'] as $song) {
                array_unshift($data, $song['id']);
            }
        }
        return json_encode([
            'code' => $code,
            'data' => $data,
        ]);
    }

    /**
     * @param int|string $album_id
     * @return mixed
     */
    protected function get_album_limit($album_id)
    {
        $data = [];
        $raw = json_decode($this->API->get_album($album_id), true);
        $code = isset($raw['code']) ? $raw['code'] : self::FAIL_CODE;
        if ($code == self::DONE_CODE) {
            foreach ($raw['songs'] as $song) {
                array_unshift($data, $song['id']);
            }
        }
        return json_encode([
            'code' => $code,
            'data' => $data,
        ]);
    }

    /**
     * @param int|string $playlist_id
     * @return mixed
     */
    protected function get_playlist_limit($playlist_id)
    {
        $data = [];
        $raw = json_decode($this->API->get_playlist($playlist_id), true);
        $code = isset($raw['code']) ? $raw['code'] : self::FAIL_CODE;
        if ($code == self::DONE_CODE) {
            foreach ($raw['playlist']['tracks'] as $song) {
                array_unshift($data, $song['id']);
            }
        }
        return json_encode([
            'code' => $code,
            'data' => $data,
        ]);
    }

    /**
     * @return null|mixed
     */
    public function get_request()
    {
        if (isset($_GET['detail'])) {
            return $this->get_detail_limit($_GET['detail']);
        }

        if (isset($_GET['album'])) {
            return $this->get_album_limit($_GET['album']);
        }

        if (isset($_GET['artist'])) {
            return $this->get_artist_limit($_GET['artist']);
        }

        if (isset($_GET['playlist'])) {
            return $this->get_playlist_limit($_GET['playlist']);
        }

        return null;
    }

}
