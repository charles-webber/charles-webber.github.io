<?php
// Defines the allowed domains for CORS
define('ALLOW_ORIGIN', '*');

// 兼容不同镜像的路径
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    require __DIR__ . '/../vendor/autoload.php';
}

use Metowolf\Meting;

// Initialize Meting logic
if (isset($_GET['type']) && isset($_GET['id'])) {
    
    $server = isset($_GET['server']) ? $_GET['server'] : 'netease';
    $type = $_GET['type'];
    $id = $_GET['id'];

    $api = new Meting($server);
    
    // --- VIP CONFIGURATION START ---
    if ($server == 'netease') {
        // [IMPORTANT] Replace the value below with your real MUSIC_U cookie from music.163.com
        // Press F12 on NetEase Music website -> Application -> Cookies -> URL decoded value of MUSIC_U
        $cookie = 'MUSIC_U=000FE8827F920D9E9A4B2EDD88111D515C916F971C7350E96F4DBBB4D3AE847CE01365DBFF24D73423F02C9ECB8318076E6F6E3495592FAA071205856DEFEE61316763E2329E11A18969E0D844D40B57283B1A2594D5A3C8C3396A5C1AFE572BEA73C6DFDB44CE8174B0E7783C8DCA66A44F8DC697C801E9679582F34313E81699053F040C4438B9F0C55F47D28DFB1F4CFF9994A6A8885C1D4D606DED14CDDAA686FBC052C9AFC36B63D2709A67FDA54C47CF675B8D6571660DF020F012E2C3F279512AF8D9C124B1E65CF225E78CE47635842BC87D1881FD77A676D3931F9F2E39BBBBA9D41268CAAAC42AEEE733793E039960E751907EA26B27F1DBD975A74EC7DFC48C6DA22DE9411BA34DF8855254EF2A43E4F04D16C9767B8E9069F87781AF762AA28BF09729B984B7956D6F76DAC8C67D7AEB5217771D629A4BB7F3542F8D093FE562D666F4140B6CB0FBBBD7195AC33DBD360F3AE7D303DF0B07888B5E0102DF84EBA71FD5A53CBE1A3EC213D5C3410AA8DE8AF57F9950C6AE88885F30852821E0D37C3CA4DE6E17312FAC1E8B8B6F03D38FB890D6881F6E6D7DA67C75;';
        $api->cookie($cookie);
    }
    // --- VIP CONFIGURATION END ---

    $api->format(true);

    // Handle requests
    if ($type == 'url') {
        $data = $api->url($id);
    } elseif ($type == 'pic') {
        $data = $api->pic($id);
    } elseif ($type == 'lrc') {
        $data = $api->lyric($id);
    } elseif ($type == 'song') {
        $data = $api->song($id);
    } elseif ($type == 'album') {
        $data = $api->album($id);
    } elseif ($type == 'artist') {
        $data = $api->artist($id);
    } elseif ($type == 'playlist') {
        $data = $api->playlist($id);
    } elseif ($type == 'search') {
        $data = $api->search($id);
    }
    
    // Output JSON
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: ' . ALLOW_ORIGIN);
    echo $data;
    exit;
}

// Default fallback if no params provided
echo '{"error":"missing headers"}';
