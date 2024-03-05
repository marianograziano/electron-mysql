const {BrowserWindow,ipcMain, Notification, Menu } =  require('electron')
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

async function getProducts() {
  const conn = await getConnection();
  const result = await conn.query('SELECT * FROM product');
  return result;
}

ipcMain.on('get-products', async (event, arg) => {
  try {
    const result = await getProducts();
    event.reply('products', result);
  }
  catch (error) {
    console.error("IPC Error: ", error);
    event.reply('products-failed', { message: 'Failed to get products.' });
  }
  
  
  const result = await getProducts();
  //console.log("Se envio al front los productos : ", result);
  event.reply('products', result); 
});




let window = null  
function createWindow () {
  const menuTemplate = [
    {
      label: 'Menu Principal',
      submenu: [
        {
          label: 'Página Principal',
          click() {
            window.loadFile('src/ui/index.html');
          },
        },
        {
          label: 'Precios',
          click() {
            window.loadFile('src/ui/precios.html');
          },
        },
        { role: 'toggleDevTools' }

      ],
    },
    // Puedes agregar más elementos al menú principal aquí
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  
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
  Menu.setApplicationMenu(menu);
  window.loadFile('src/ui/index.html')
      // Escuchar el evento de maximizar
      window.on('maximize', () => {
        // Poner la ventana en pantalla completa
        
    });
  
    // Opcional: Escuchar el evento de salida de pantalla completa
    // Para manejar el caso de usar ESC para salir de pantalla completa
    window.on('leave-full-screen', () => {
        window.unmaximize();
    });

  }






module.exports = {createWindow}