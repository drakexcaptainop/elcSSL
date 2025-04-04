// Substitution cipher implementation
const substitutionCipher = {
    encrypt: (text) => {

        key = 'exflmdwucgpvksqzyonhjbrtai'
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const keyMap = {};
        alphabet.split("").forEach((char, index) => {
            keyMap[char] = key[index];
            keyMap[char.toUpperCase()] = key[index].toUpperCase();
        });

        return text
            .split("")
            .map((char) => {
                const lowerChar = char.toLowerCase();
                return keyMap[lowerChar] ? (char === lowerChar ? keyMap[lowerChar] : keyMap[lowerChar].toUpperCase()) : char;
            })
            .join("");
    },

    decrypt: (text) => {

        key = 'exflmdwucgpvksqzyonhjbrtai'
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const reverseKeyMap = {};
        key.split("").forEach((char, index) => {
            reverseKeyMap[char] = alphabet[index];
            reverseKeyMap[char.toUpperCase()] = alphabet[index].toUpperCase();
        });

        return text
            .split("")
            .map((char) => {
                const lowerChar = char.toLowerCase();
                return reverseKeyMap[lowerChar] ? (char === lowerChar ? reverseKeyMap[lowerChar] : reverseKeyMap[lowerChar].toUpperCase()) : char;
            })
            .join("");
    },
};

const { log } = require('console');
// Example usage:
// const key = "qwertyuiopasdfghjklzxcvbnm";
// const encrypted = substitutionCipher.encrypt("hello", key);
// const decrypted = substitutionCipher.decrypt(encrypted, key);


module.exports = substitutionCipher;