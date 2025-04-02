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

function generateCSR ( privateKey, ok, err ) {
    openssl.generateCSR(csroptions, privateKey, rsakeyoptions.encryption.password, (error, csr) => {
        if (error) {
            console.error('Error generating CSR:', error)
            return err(error)
        }
        ok(csr)
    })
}

function generateCSRPromise (privateKey){
    return new Promise((resolve, reject) => {
        generateCSR(privateKey, resolve, reject)
    })
}

function generatePrivateKeyPromise (){
    return new Promise((resolve, reject) => {
        generatePrivateKey(resolve, reject)
    })
}

function generatePrivateKey ( ok, err ) {
    openssl.generateRSAPrivateKey(rsakeyoptions, (error, privateKey) => {
        if (error) {
            console.error('Error generating private key:', error)
            return error(err)
        }
        ok(privateKey)
    })
}


module.exports = {
    generateCSRPromise: generateCSRPromise,
    generatePrivateKeyPromise: generatePrivateKeyPromise,
    generateCSR: generateCSR,
    generatePrivateKey: generatePrivateKey
}

