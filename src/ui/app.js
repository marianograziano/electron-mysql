const { ipcRenderer } = require('electron');
const productForm = document.getElementById('productForm');
const productName = document.getElementById('name');
const productPrice = document.getElementById('price');
const productDescription = document.getElementById('description');

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