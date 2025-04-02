const net = require('net')

const socket = net.createConnection(  { port: 443, host: 'www.google.com' })

socket.on('connect', () => {    
    console.log('Connected to server')
})

socket.on('data', (data) => {
    
})