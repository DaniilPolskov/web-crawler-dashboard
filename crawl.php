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
    $html = @file_get_contents($url);

    if ($html === false) {
        return ['error' => 'Failed to retrieve page content.'];
    }

    preg_match_all('/<h2 class="product-title">(.*?)<\/h2>/', $html, $productNames);
    preg_match_all('/<span class="price">(.*?)<\/span>/', $html, $prices);

    $products = [];
    for ($i = 0; $i < count($productNames[1]); $i++) {
        $products[] = [
            'name' => trim($productNames[1][$i]),
            'price' => trim($prices[1][$i] ?? 'Price not found'),
        ];
    }

    return [
        'products' => $products,
        'categories' => ['Electronics', 'Clothing', 'Home Goods']
    ];
}

?>
