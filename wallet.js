let EC = require('elliptic').ec,
    fs = require('fs');
// create and initialize the EC context
const ec = new EC('secp256k1'),
     
privateKeyLocation = __dirname + '/wallet/private_key';


exports.initWallet = () => {
    let privateKey;
// generate a new wallet only if one doesnot exist
    if (fs.existsSync(privateKeyLocation)){
        const buffer = fs.readFileSync(privateKeyLocation, "utf8");
        privateKey = buffer.toString();
    } else {
        privateKey = generatePrivateKey();
        fs.writeFileSync(privateKeyLocation, privateKey);
    }
//generate actual public-private key
    const key = ec.keyFromPrivate(privateKey,'hex');
    const publicKey = key.getPublic().encode('hex');
    return({'privateKeyLocation':privateKeyLocation, 'publicKey': publicKey});
};
const generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

let wallet = this;
let retVal = wallet.initWallet();
console.log(JSON.stringify(retVal));
