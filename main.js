const electron = require('electron')
const net = require('net')

const { app, BrowserWindow } = electron

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.loadFile('index.html')

    // Add a button to open dev tools
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.executeJavaScript(`
            const devToolsButton = document.createElement('button');
            devToolsButton.textContent = 'Open Dev Tools';
            devToolsButton.style.position = 'fixed';
            devToolsButton.style.bottom = '10px';
            devToolsButton.style.right = '10px';
            devToolsButton.style.zIndex = '1000';
            devToolsButton.onclick = () => require('electron').remote.getCurrentWindow().webContents.openDevTools();
            document.body.appendChild(devToolsButton);
        `);
    });
})

