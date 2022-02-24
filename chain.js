//it contains the first block (genesis block), as well as method to receive the entire blockchain
// object, as well as a method to receive entire blockchain object, add a block & retrieve a block

let Block = require("./block.js").Block,
    BlockHeader = require("./block.js").BlockHeader,
    moment = require("moment");

let getGenesisBlock = () => {
    let blockHeader = new BlockHeader(1, null, "0x1bc3300000000000000000000000000000000000000000000",
    moment().unix()); 
    return new Block(blockHeader, 0, null);
};

let getLatestBlock = () => blockchain[blockchain.length-1];

let addBlock = (newBlock) => {
    let prevBlock = getLatestBlock();
    if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot){
        blockchain.push(newBlock);
    }
}

let getBlock = (index) => {
    if (blockchain.length-1 >= index)
       return blockchain[index];
    else
       return null;
}
const blockchain = [getGenesisBlock()];

if (typeof exports != 'undefined') {
    exports.addBlock = addBlock;
    exports.getBlock = getBlock;
    exports.blockchain = blockchain;
    exports.getLatestBlock = getLatestBlock;
}