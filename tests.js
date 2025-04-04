let fs = require('fs')

let {ipcRenderer} = require('electron')
console.log(fs.readFileSync('./server.options.json', 'ascii'))