<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$url = file_get_contents('urls.txt');

if ($url === false) {
    echo json_encode(['error' => 'Failed to load URL from file.']);
    exit;
}

$url = trim($url);

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['error' => 'Invalid URL.']);
    exit;
}

$data = crawlStore($url);
echo json_encode($data);

function crawlStore($url) {
}
?>
