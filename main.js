const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  });

 
  win.loadFile(path.join(__dirname, 'secretario/html1/index.html'));

  // win.webContents.openDevTools();
}
app.whenReady().then(createWindow);

// Cerrar la app cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
