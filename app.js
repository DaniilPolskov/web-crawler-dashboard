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
        display.innerHTML += `<div class="product"><strong>${product.name}</strong>: ${product.price} - <span class="discount">${product.discount}</span> (${product.category})</div>`;
    });
    
    display.innerHTML += '<h2>Categories:</h2>';
    data.categories.forEach(category => {
        display.innerHTML += `<p>${category}</p>`;
    });

    drawCategoryChart(data.products);
}

function drawCategoryChart(products) {
    const categoryCounts = {};

    products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);
    const total = counts.reduce((sum, count) => sum + count, 0);

    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = 0;

    const radius = 250; 

    categories.forEach((category, index) => {
        const sliceAngle = (counts[index] / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(300, 300);
        ctx.arc(300, 300, radius, startAngle, endAngle);
        ctx.fillStyle = getRandomColor();
        ctx.fill();
        ctx.closePath();

        startAngle = endAngle;
    });

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    startAngle = 0;

    const textOffset = radius * 0.5; 

    categories.forEach((category, index) => {
        const sliceAngle = (counts[index] / total) * 2 * Math.PI;
        const middleAngle = startAngle + sliceAngle / 2;

        ctx.fillText(`${category} (${counts[index]})`, 
            300 + Math.cos(middleAngle) * textOffset, 
            300 + Math.sin(middleAngle) * textOffset
        );
        startAngle += sliceAngle;
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
