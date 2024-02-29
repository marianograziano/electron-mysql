const {BrowserWindow,ipcMain, Notification} =  require('electron')
const { getConnection } = require('./database');

async function createProduct(product) {
  try {
    const conn = await getConnection();
    product.price = parseFloat(product.price);
    const resultado = await conn.query('INSERT INTO product SET ?', product);
    
    new Notification({
      title: 'Sistema de Productos',
      body: 'Nuevo producto guardado'
    }).show();

    product.id = resultado.insertId;
    console.log("Se guardo el Producto: ", product);
    return product;
  } catch (error) {
    console.error(error);
    new Notification({
      title: 'Error de Sistema',
      body: 'No se pudo guardar el producto'
    }).show();
    return undefined; // Explicitly return undefined to indicate failure
  } 
}

ipcMain.on('create-product', async (event, arg) => {
  try {
    const respuesta = await createProduct(arg);
    
    event.reply('product-saved', respuesta);
    console.log("Se envio al front el producto : ", respuesta);
  } catch (error) {
    console.error("IPC Error: ", error);
    event.reply('product-save-failed', { message: 'Failed to save product.' });
  }
});

let window = null  
function createWindow () {
  window  = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    },
  })

  window.loadFile('src/ui/index.html')
}


module.exports = {createWindow}