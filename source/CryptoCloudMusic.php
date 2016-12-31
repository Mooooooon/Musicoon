<?php

// RSA Algorithm required
require 'BigInteger.php';


class CryptoCloudMusic
{

    // General
    const MODULUS = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
    const PUBKEY = '010001';
    const NONCE = '0CoJUm6Qyw8W8jud';
    const ABC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const VI = '0102030405060708';
    const COOKIE = 'os=pc; osver=Microsoft-Windows-10-Professional-build-14393-64bit; appver=2.1.0.145894; channel=netease; __remember_me=true';
    const REFERER = 'http://music.163.com/';
    const USERAGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36';

    // Use keygen secret key
    protected $secret_key;
    protected $encrypt_secret_key;


    public function __construct()
    {
        $this->secret_key = $this->create_secret_key(16);
    }

    /**
     * @param int $length
     * @return string
     */
    protected function create_secret_key($length)
    {
        $result = '';
        $max_index = strlen(self::ABC) - 1;
        for ($i = 0; $i < $length; $i++) {
            $result .= self::ABC[rand(0, $max_index)];
        }
        return $result;
    }

    /**
     * @param array $raw
     * @return mixed
     */
    protected function create_encrypt_data($raw)
    {
        $data['params'] = $this->aes_encode(json_encode($raw), self::NONCE);
        $data['params'] = $this->aes_encode($data['params'], $this->secret_key);
        $data['encSecKey'] = $this->rsa_encode($this->secret_key);
        return $data;
    }

    protected function aes_encode($secret_data, $secret)
    {
        return openssl_encrypt($secret_data, 'aes-128-cbc', $secret, false, self::VI);
    }

    protected function rsa_encode($text)
    {
        $rev_text = strrev(utf8_encode($text));
        $key_text = $this->bc_hexdec($this->str_to_hex($rev_text));
        $a = new Math_BigInteger($key_text);
        $b = new Math_BigInteger($this->bc_hexdec(self::PUBKEY));
        $c = new Math_BigInteger($this->bc_hexdec(self::MODULUS));
        $key = $a->modPow($b, $c)->toHex();
        return str_pad($key, 256, '0', STR_PAD_LEFT);
    }

    protected function bc_hexdec($hex)
    {
        $dec = 0;
        $len = strlen($hex);
        for ($i = 0; $i < $len; $i++) {
            $dec = bcadd($dec, bcmul(strval(hexdec($hex[$i])), bcpow('16', strval($len - $i - 1))));
        }
        return $dec;
    }

    protected function str_to_hex($str)
    {
        $hex = '';
        $len = strlen($str);
        for ($i = 0; $i < $len; $i++) {
            $hex .= dechex(ord($str[$i]));
        }
        return $hex;
    }

    /**
     * @param string $url
     * @param array|null $data
     * @return mixed
     */
    protected function curl($url, $data = null)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        if ($data) {
            if (is_array($data)) {
                $data = http_build_query($data);
            }
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            curl_setopt($curl, CURLOPT_POST, 1);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($curl, CURLOPT_COOKIE, self::COOKIE);
        curl_setopt($curl, CURLOPT_REFERER, self::REFERER);
        curl_setopt($curl, CURLOPT_USERAGENT, self::USERAGENT);
        $result = curl_exec($curl);
        curl_close($curl);
        return $result;
    }

}
