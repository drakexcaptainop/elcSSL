const openssl_node = require('node-openssl-cert')
const fs = require('fs')
const { log } = require('console')
const openssl = new openssl_node()

var rsakeyoptions = {
	encryption: {
		password: 'test',
		cipher: 'des3'
	},
	rsa_keygen_bits: 2048,
	rsa_keygen_pubexp: 65537,
// Specify the file path for the private key
}


var csroptions = {
	hash: 'sha256',
	subject: {
		countryName: 'US',
		stateOrProvinceName: 'Louisiana',
		localityName: 'Slidell',
		postalCode: '70458',
		streetAddress: '1001 Gause Blvd.',
		organizationName: 'SMH',
		organizationalUnitName: 'IT',
		commonName: [
			'certificatetools.com',
			'www.certificatetools.com'
		],
		emailAddress: 'lyas.spiehler@slidellmemorial.org'
	}
}

function generateCSR ( ok, err ) {
    let data = fs.readFileSync('./keys/privateKey.key','utf8')
    openssl.generateCSR(csroptions, data, "test", (err, csr) => {
        if (err) {
            console.error('Error generating CSR:', err)
            return err(error)
        }
        fs.writeFileSync('./keys/certificateRequest.csr', csr)
        ok()
    })
    
}

function generateCSRPromise (){
    return new Promise((resolve, reject) => {
        generateCSR(resolve, reject)
    })
}

function generatePrivateKeyPromise (){
    return new Promise((resolve, reject) => {
        generatePrivateKey(resolve, reject)
    })
}

function generatePrivateKey ( ok, err ) {
    openssl.generateRSAPrivateKey(rsakeyoptions, (err, privateKey) => {
        if (err) {
            console.error('Error generating private key:', err)
            return err(err)
        }
        fs.writeFileSync('./keys/privateKey.key', privateKey)
        ok()
    })
}

generateCSR(_=>{}, _=>{})

