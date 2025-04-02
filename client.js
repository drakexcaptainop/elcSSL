const net = require('net')
const {Buffer} = require('buffer')
const {generatePrivateKeyPromise, generateCSRPromise} = require('./openSSLUtils')
const fs = require('fs')
const FLAGS = {
    CSR: Buffer.from("CSR"),
    TXT: Buffer.from("TXT"),
}

class Client{
    constructor(privateKeyPath, csrPath){
        this.privateKeyPath = privateKeyPath
        this.csrPath = csrPath
        this.addr = null 
        this.socket = null
        this.privateKey = null
    }
    connectServer(port, host){
        this.addr = [port, host]
        this.socket = net.createConnection(  { port: this.addr[0], host: this.addr[1] })
        return this
    }

    async requestSession(){

    }

    loadPrivateKey(privateKey){
        if(this.privateKey) return this.privateKey
        this.privateKey = privateKey || fs.readFileSync(this.privateKeyPath, 'utf8')
        return this.privateKey
    }
    async createPrivateKey(  ){
        const privateKey = await generatePrivateKeyPromise()
        console.log(privateKey)
        fs.writeFileSync(this.privateKeyPath, privateKey)
        return this

    }
    async requestCertificate(){
        let privateKey = this.loadPrivateKey()
        const certificate = await generateCSRPromise(privateKey)
        console.log(certificate)
        fs.writeFileSync(this.csrPath, certificate)
        return this
    }
}


module.exports = Client