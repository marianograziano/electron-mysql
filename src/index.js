const {createWindow} = require('./main')
const {app, Menu} = require('electron')


require ('./database')
require('electron-reload')(__dirname)

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
          label: 'Página 1',
          click() {
            window.loadFile('src/ui/precios.html');
          },
        },
        {
          label: 'Página 2',
          click() {
            window.loadFile('src/ui/pagina2.html');
          },
        },
      ],
    },
    // Puedes agregar más elementos al menú principal aquí
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);
