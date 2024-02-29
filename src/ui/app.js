const { ipcRenderer } = require('electron');
const productForm = document.getElementById('productForm');
const productName = document.getElementById('name');
const productPrice = document.getElementById('price');
const productDescription = document.getElementById('description');
const productsList = document.getElementById('products');

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        name: productName.value,
        price: productPrice.value,
        description: productDescription.value   
    };
    ipcRenderer.send('create-product', newProduct);
    ipcRenderer.on('product-saved', (event, product) => {
        console.log("Se recibio del back el producto: ", product);
        
      });
});

// // ipcRenderer.on('product-save-failed', (event, message) => {
// //     console.error("IPC Error: ", message);
// }, false);

function renderProducts(products) {

    productsList.innerHTML = '';
    products.forEach((product) => {
        productsList.innerHTML += `
        <div class="card card-body my-2">
            <h4>${product.name}</h4>
            <p><strong>Precio: </strong>${product.price}</p>
            <p>${product.description}</p>
            
        </div>
        `;
    });
}

ipcRenderer.send('get-products', {});   

ipcRenderer.on('products', (event, products) => {
    console.log("Se recibio del back los productos: ", products);
    renderProducts(products);
}   );
