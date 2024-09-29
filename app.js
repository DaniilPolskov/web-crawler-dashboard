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
    display.innerHTML = '';

    if (data.error) {
        display.innerHTML += `<p>${data.error}</p>`;
        return;
    }

    const products = data.products;

    const categoryCounts = getCategoryCounts(products);
    displayCategories(categoryCounts);

    display.innerHTML += '<h2>Products:</h2>';
    products.forEach(product => {
        display.innerHTML += `<div class="product"><strong>${product.name}</strong>: ${product.price} - <span class="discount">${product.discount}</span> (${product.category})</div>`;
    });

    drawCategoryChart(products);
    drawPriceChart(products);
    drawDiscountChart(products);
}

function getCategoryCounts(products) {
    const categoryCounts = {};
    products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    return categoryCounts;
}

function displayCategories(categoryCounts) {
    let display = document.getElementById('dataDisplay');
    display.innerHTML += '<h2>Popular Categories:</h2>';
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const table = document.createElement('table');
    table.innerHTML = `<tr><th>Category</th><th>Count</th></tr>`;
    
    sortedCategories.forEach(([category, count]) => {
        const row = table.insertRow();
        const categoryCell = row.insertCell(0);
        const countCell = row.insertCell(1);
        categoryCell.innerText = category;
        countCell.innerText = count;
    });
    
    display.appendChild(table);
}

function drawCategoryChart(products) {
    const categoryCounts = getCategoryCounts(products);
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

function drawPriceChart(products) {
    const prices = products
        .map(product => parseFloat(product.price.replace(/[^0-9.-]+/g, "")) || 0)
        .filter(price => price > 0);

    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');

    if (prices.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('No Products Available', canvas.width / 2 - 50, canvas.height / 2);
        return;
    }

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const histogram = new Array(10).fill(0);
    
    prices.forEach(price => {
        const index = Math.floor((price - minPrice) / (priceRange / histogram.length));
        histogram[Math.min(index, histogram.length - 1)]++;
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / histogram.length;

    histogram.forEach((count, index) => {
        if (count > 0) {
            ctx.fillStyle = getRandomColor();
            ctx.fillRect(index * barWidth, canvas.height - count * 10, barWidth - 2, count * 10);
            
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(count, index * barWidth + barWidth / 2 - 10, canvas.height - count * 10 - 5);
        }
    });

    ctx.fillStyle = 'black';
    ctx.font = '8px Arial';
    
    for (let i = 0; i < histogram.length; i++) {
        const lowerBound = (minPrice + (priceRange / histogram.length) * i).toFixed(2);
        const upperBound = (minPrice + (priceRange / histogram.length) * (i + 1)).toFixed(2);
        ctx.fillText(`${lowerBound} - ${upperBound}`, i * barWidth + barWidth / 4 - 10, canvas.height - 5);
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Price Distribution', canvas.width / 2 - 50, 20);
}

function drawDiscountChart(products) {
    const discounts = products
        .map(product => ({
            name: product.name,
            discount: parseFloat(product.discount.replace(/[^0-9.-]+/g, "")) || 0
        }))

    const canvas = document.getElementById('discountChart');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (discounts.length === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('No Discounts Available', canvas.width / 2 - 50, canvas.height / 2);
        return;
    }

    const labels = discounts.map(item => item.name);
    const discountValues = discounts.map(item => item.discount);

    const maxDiscount = Math.max(...discountValues);
    const minDiscount = Math.min(...discountValues);
    const scaleFactor = canvas.height / (maxDiscount - minDiscount) * 0.8;

    ctx.beginPath();
    ctx.moveTo(50, canvas.height - (discountValues[0] - minDiscount) * scaleFactor - 20);

    discountValues.forEach((discount, index) => {
        const x = 50 + index * (canvas.width - 100) / (discountValues.length - 1);
        const y = canvas.height - (discount - minDiscount) * scaleFactor - 20;
        ctx.lineTo(x, y);
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    ctx.fillStyle = 'black';
    labels.forEach((label, index) => {
        const x = 50 + index * (canvas.width - 100) / (discountValues.length - 1);
        const y = canvas.height - (discountValues[index] - minDiscount) * scaleFactor - 20;

        ctx.fillText(label, x - 15, y - 10);

        ctx.fillText(`${discountValues[index]}%`, x - 15, y + 10);
    });

    ctx.fillText('Discount Distribution', canvas.width / 2 - 50, 20);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
