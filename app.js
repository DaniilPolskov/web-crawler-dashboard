document.getElementById('fetchData').addEventListener('click', function() {
    fetch('http://localhost/crawl/crawl.php', {
        method: 'GET',
        headers: {
            'X-API-Key': 'my-super-secret-key-12345'
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
        display.innerHTML += `<div class="product"><strong>${product.name}</strong>: ${product.price}</div>`;
    });
    
    display.innerHTML += '<h2>Categories:</h2>';
    data.categories.forEach(category => {
        display.innerHTML += `<p>${category}</p>`;
    });
}
