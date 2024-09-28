<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$validApiKey = 'my-super-secret-key-12345';

$headers = apache_request_headers();
$apiKey = isset($headers['X-API-Key']) ? $headers['X-API-Key'] : '';
$url = file_get_contents('urls.txt');

if ($apiKey !== $validApiKey) {
    echo json_encode(['error' => 'Invalid API Key']);
    exit;
}

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

$query = isset($_GET['query']) ? $_GET['query'] : '';
$categoryFilter = isset($_GET['category']) ? $_GET['category'] : '';

$data = crawlStore($url);
$response = filterProducts($data, $query, $categoryFilter);
echo json_encode($response);

function crawlStore($url) {
    $html = @file_get_contents($url);

    if ($html === false) {
        return ['error' => 'Failed to retrieve page content.'];
    }

    preg_match_all('/<h2 class="product-title">(.*?)<\/h2>/', $html, $productNames);
    preg_match_all('/<span class="price">(.*?)<\/span>/', $html, $prices);
    preg_match_all('/<span class="discount">(.*?)<\/span>/', $html, $discounts);
    preg_match_all('/<div class="category">(.*?)<\/div>/', $html, $categories);

    $products = [];
    for ($i = 0; $i < count($productNames[1]); $i++) {
        $products[] = [
            'name' => trim($productNames[1][$i]),
            'price' => trim($prices[1][$i] ?? 'Price not found'),
            'discount' => trim($discounts[1][$i] ?? 'No discount'),
            'category' => trim($categories[1][$i] ?? 'Uncategorized'),
        ];
    }

    $uniqueCategories = array_unique(array_map('trim', $categories[1]));

    return [
        'products' => $products,
        'categories' => $uniqueCategories,
    ];
}

function filterProducts($data, $query, $categoryFilter) {
    if (isset($data['error'])) {
        return $data;
    }

    $filteredProducts = array_filter($data['products'], function($product) use ($query, $categoryFilter) {
        $nameMatches = stripos($product['name'], $query) !== false;
        $categoryMatches = empty($categoryFilter) || stripos($product['category'], $categoryFilter) !== false;

        return $nameMatches && $categoryMatches;
    });

    return [
        'products' => array_values($filteredProducts),
        'categories' => $data['categories'],
    ];
}
?>
