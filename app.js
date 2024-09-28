const apiKey = 'my-super-secret-key-12345';

document.getElementById('fetchData').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value;
    const categoryFilter = document.getElementById('categorySelect').value;

    const url = `http://localhost/crawl/crawl.php?query=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryFilter)}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-API-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => displayData(data))
    .catch(error => console.error('Error:', error));
});

function displayData(data) {
    let display = document.getElementById('dataDisplay');
    display.innerHTML = '<h2>Products:</h2>';

    if (data.error) {
        display.innerHTML += `<p>${data.error}</p>`;
        return;
    }

    data.products.forEach(product => {
        display.innerHTML += `<div class="product"><strong>${product.name}</strong>: ${product.price} (${product.category})</div>`;
    });
    
    display.innerHTML += '<h2>Categories:</h2>';
    data.categories.forEach(category => {
        display.innerHTML += `<p>${category}</p>`;
    });
}
