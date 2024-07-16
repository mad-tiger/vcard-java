const fs = require('fs');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Création de la vCard 4.0 avec champ supplémentaire
function createVCard(name, phone, email, infoSupplementaire) {
  return `BEGIN:VCARD
VERSION:4.0
N:${name}
TEL;TYPE=cell:${phone}
EMAIL:${email}
NOTE:${infoSupplementaire}
END:VCARD`;
}

// Chiffrement de la vCard avec un code PIN
function encryptVCard(vcard, pin) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(pin, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cfb', key, iv);
  let encryptedVCard = cipher.update(vcard, 'utf8', 'base64');
  encryptedVCard += cipher.final('base64');
  return Buffer.concat([salt, iv, Buffer.from(encryptedVCard, 'base64')]).toString('base64');
}

// Génération du QR Code
function generateQRCode(data) {
  qrcode.toFile('vcard_qr.png', data, { errorCorrectionLevel: 'L' }, (err) => {
    if (err) throw err;
    console.log('QR Code généré et enregistré sous "vcard_qr.png".');
  });
}

// Fonction principale
function main() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Entrez le nom: ', (name) => {
    readline.question('Entrez le numéro de téléphone: ', (phone) => {
      readline.question('Entrez l\'email: ', (email) => {
        readline.question('Entrez les informations supplémentaires: ', (infoSupplementaire) => {
          readline.question('Entrez le code PIN: ', (pin) => {
            const vcard = createVCard(name, phone, email, infoSupplementaire);
            const encryptedVCard = encryptVCard(vcard, pin);
            generateQRCode(encryptedVCard);
            readline.close();
          });
        });
      });
    });
  });
}

main();
