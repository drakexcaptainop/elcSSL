const electron = require('electron')
const net = require('net')

const { app, BrowserWindow, Menu } = electron

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.loadFile('index.html')
    let menuTemplate = [
        { label: 'Server', click: () => {
            // Create a new BrowserWindow for the "Server" menu
            let serverWindow = new BrowserWindow({
                width: 400,
                height: 300,
                parent: mainWindow, // Optional: Makes the new window a child of the main window
                modal: true, // Optional: Makes the new window modal
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });
            // Load the HTML file for the new window
            serverWindow.loadFile('serverOptions.html');
            serverWindow.on('closed', () => {
                console.log('Server window closed')
                mainWindow.webContents.send('serverWindowClosed')
            })
        } }
    ]

    Menu.setApplicationMenu( Menu.buildFromTemplate(menuTemplate) )
})

