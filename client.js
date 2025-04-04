const net = require('net')
const {Buffer} = require('buffer')
const {generatePrivateKeyPromise, generateCSRPromise, generateCSR, generateDocumentSignature} = require('./openSSLUtils')
const fs = require('fs')
const { log } = require('console')
const substitutionCipher = require('./utils/crypto_utils.js')
const FLAGS = {
    CSR: Buffer.from("CSR"),
    TXT: Buffer.from("TXT"),
    SES: Buffer.from("SES"),
    SGN: Buffer.from("SGN"),
}

class Client{
    instance
    constructor(privateKeyPath, csrPath){
        this.privateKeyPath = privateKeyPath
        this.csrPath = csrPath
        this.addr = null 
        this.socket = null
        this.privateKey = null
        this.sessionKey = null
        this.sessionKeyBytes = null
        this.socketIsClosed = true
        Client.instance = this
    }
    async connectServer(port, host){
        return new Promise((resolve, reject) => {
            this.addr = [port, host]
            this.socket = net.createConnection(  { port, host })
            this.socket.on('close', () => {
                this.socketIsClosed = true
            })
            this.socket.once('connect', () => {
                console.log('Connected to server')
                this.socketIsClosed = false
                resolve(this.socket)
            })
            this.socket.once('error', (err) => {
                this.socketIsClosed = true 
                reject(err);
            });
        })
    }
    writeSessionKey(keyBytes){
        this.sessionKey = keyBytes.toString('utf8') //cambio
        this.sessionKeyBytes = Buffer.from(this.sessionKey, 'utf8') //cambio
        console.log('Session key:', this.sessionKey)
        fs.writeFileSync('./session/session.key', keyBytes)
        return true
    }
    loadSessionKey() {
        if(this.sessionKey && this.sessionKeyBytes) return true
        const sessionKeyPath = './session/session.key';
        if (fs.existsSync(sessionKeyPath)) {
            this.sessionKey = fs.readFileSync(sessionKeyPath, 'utf8');
            this.sessionKeyBytes = Buffer.from(substitutionCipher.encrypt(this.sessionKey), 'utf8') //cambio
            console.log('Session key loaded from file:', this.sessionKey);
            return true
        } else {
            console.log('Session key file not found:', sessionKeyPath);
            return false;
        }
    }
    async requestSession(){
        return new Promise((resolve, reject) => {
            if(this.loadSessionKey()) {
                console.log('Loaded session key from file:', this.sessionKey);
                return resolve(this.sessionKey)
                
            }
            let bytes = FLAGS.SES
            this.socket.write(bytes, (err) => {
                console.log('Requesting session key from server...')
                if (err) {
                    reject(err);
                } else {
                    this.socket.once('data', (data) => {
                        this.writeSessionKey(data)
                        resolve(this.loadSessionKey())
                    })

                }
            })
        })
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

    createDocumentSignature(document,){
        let privateKey = this.loadPrivateKey()
        let signedBytes = generateDocumentSignature(document, privateKey)
        console.log('Document signature:', signedBytes.toString('base64'))
        return signedBytes
    }

    async validateDocument( document, fake ){
        return new Promise((resolve, reject) => {
            let privateKey = this.loadPrivateKey()
            let signature = generateDocumentSignature(document, privateKey)
            fs.writeFileSync('./signatures/signature.sha256', signature)
            let bytes = Buffer.concat([FLAGS.TXT, this.sessionKeyBytes, signature, fake ? Buffer.from(fake): Buffer.from(document) ])
            this.socket.write(bytes, (err) => {
                if (err) {
                    console.error('Error writing document to socket:', err)
                    return reject(err)
                }
                this.socket.once('data', (data) => {
                    console.log('Received response to document validation from server:', data.toString())
                    return resolve(data.toString())
                })
            })
        })
    }   
    static getInstance(){
        return Client.instance
    }
    static createInstance(privateKeyPath, csrPath){
        Client.instance = new Client(privateKeyPath, csrPath)
        return Client.instance
    }

    async requestCertificate(){
        return new Promise((resolve, reject) => {
            if(this.socket == null){
                console.error('Socket is not connected')
                reject(new Error('Socket is not connected'))
                return false
            }
            let privateKey = this.loadPrivateKey()
            generateCSR( privateKey, (certificate) => {
                console.log('Generated CSR:', certificate)
                let requestBytes = Buffer.concat([FLAGS.CSR, this.sessionKeyBytes, Buffer.from(certificate)])
                this.socket.write(requestBytes, (err) => {
                    if(err){
                        console.error('Error writing CSR to socket:', err)
                        reject(err)
                        return false
                    }
                    this.socket.once('data', (data) => {   
                        console.log('Received response to certificate request from server:', data.toString())
                        resolve(true)
                    })

                })
            }, (error)=>reject(error)) //string
            
        })
    }
}

async function main(){
    let client = new Client('./keys/privateKey.key', './keys/csr.pem')
    await client.connectServer( 12345, "192.168.0.24" )
    await client.requestSession()
    await client.requestCertificate()
    let doc = "Hello World"
    await client.validateDocument(doc, "Fake Document")
    while(1){}
}

module.exports = Client
