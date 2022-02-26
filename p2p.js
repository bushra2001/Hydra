//impory statement for the open source libraries
//using const instead of let; to ensure there is no rebinding
const crypto = require('crypto'),
  Swarm = require('discovery-swarm'),
  defaults = require('dat-swarm-defaults');
  getPort = require ('get-port');
//Set variables to hold an object with the peers and connection sequence
const chain = require('./chain.js');

const peers = {};
let connSeq = 0;
let CronJob = require('cron').CronJob;

//keep track of registered miners as well as who mined the last block
let registeredMiners = [];
//Hydra is a channel name that all nodes connecting to
let channel = 'Hydra';

//set randomly generated peer ID for utilizing crypto library 
const myPeerId = crypto.randomBytes(32);
chain.createDb(myPeerId.toString('hex'));

console.log('my PeerId: ' + myPeerId.toString('hex'));

//Generate config object that holds peerID
const config = defaults({
    id:myPeerId,
});

//Using config object to initialize swarm library
//Swarm library create a network swarm that uses discovery-channel to find and connect peers on a UCP/TCP network
const swarm = Swarm(config);
async function f() {
    //Listen on random port selected and once a connection made to a peer
    // using setKeepAlive to ensure the network connection stays with other peers

        const port = await getPort();
        swarm.listen(port);
        console.log('Listening port: ' + port);
        swarm.join(channel);
        swarm.on('connection', (conn, info) => {
            const seq = connSeq;
            const peerId = info.id.toString('hex');
            console.log(`Connected #${seq} to peer: ${peerId}`);
            if (info.initiator){
                try {
                    conn.setKeepAlive(true,600);
                } catch (exception) {
                    console.log('exception', exception);
                }
            }
    //Once data message received on p2p network, parse data using JSON.parse; decoding msg back into an object
    //toString command converts bytes into readable string data type.
            conn.on('data', data => {
                const message = JSON.parse(data);
                console.log('----------- Received Message start------');
                console.log(
                    'from: ' + peerId.toString('hex'),
                    'to: ' + peerId.toString(message.to),
                    'my: ' + myPeerId.toString('hex'),
                    'type: ' + JSON.stringify(message.type)
                );
                console.log('---------Received Message end -------');       
 
            });
    // Listening to close event, indicating lost connection with peers
            conn.on('close', () => {
                console.log(`Connection ${seq} closed, peerId:${peerId}`);
                if (peers[peerId].seq === seq){
                    delete peers[peerId]
                }
            });
            if (!peers[peerId]) {
                peers[peerId] = {}
            }
            peers[peerId].conn = conn;
            peers[peerId].seq = seq;
            connSeq++


        })
        switch (message.type) {
            case MessageType.REQUEST_BLOCK:
                console.log('----------REQUEST BLOCK------------');
                let requestedIndex = (JSON.parse(JSOn.stringify(message.data))).index;
                let requestedBlock = chain.getBlock(requestedIndex);
                if (requestedBlock)
                writeMessageToPeerToId(peerId.toString('hex'),
                MessageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                else
                  console.log('No block found @ index: ' + requestedIndex);
                console.log('-------REQUEST_BLOCK-------------');
                break;
            case MessageType.RECEIVE_NEXT_BLOCK:
                console.log('------Receive_Next_Block----------');
                chain.addBlock(JSON.parse(JSON.stringify(message.data)));
                console.log(JSON.stringify(chain.blockchain));
                let nextBlockIndex = chain.getLatestBlock().index+1;
                console.log('--request next block @ index: ' + nextBlockIndex);
                writeMessageToPeers(MessageType.REQUEST_BLOCK, {index:nextBlockIndex});
                console.log('------Receive Next Block -----------');
                break;
            case MessageType.REQUEST_ALL_REGISTER_MINERS:
                console.log('--------REQUEST_ALL_REGISTER_MINERS------'+ message.to);
                writeMessageToPeers(MessageType.REGISTER_MINER,registeredMiners);
                registeredMiners = JSON.parse(JSON.stringify(message.data));
                console.log('--------REQUEST_ALL_REGISTER_MINERS------' +message.to);
                break;
            case MessageType.REGISTER_MINER:
                console.log('--------REGISTER_MINER------------'+ message.to);
                let miners = JSON.stringify(message.data);
                registeredMiners = JSON.parse(miners);
                console.log(registeredMiners);
                console.log('--------REGISTER_MINER---------'+message.to);
                break;
            case MessageType.RECEIVE_NEW_BLOCK:
                if ( message.to === myPeerId.toString('hex') && message.from!== myPeerId.toString('hex')){
                    console.log('-----RECEIVE_NEW_BLOCK-------'+ message.to);
                    chain.addBlock(JSON.parse(JSON.stringify(message.data)));
                    console.log(JSON.stringify(chain.blockchain));
                    console.log('-----RECEIVE_NEW_BLOCK--------'+message.to);
                }
                break;
        }
                    console.log(`Connection ${seq} closed, peerId: ${peerId}`);
            if (peers[peerId].seq === seq){
                delete peers[peerId];
                console.log('----registeredMiners before: ' + JSON.stringify(registeredMiners));
                let index = registeredMiners.indexOf(peerId);
                if (index > -1)
                   registeredMiners.splice(index, 1);
                console.log('--- registeredMiners end: '+ JSON.stringify(registeredMiners));
                

            };
    };
//send msg after ten seconds to any available peers
setTimeout(function(){
    writeMessageToPeers('hello', null);
}, 10000);
//writeMessageToPeers will be sending message to all connected pairs
writeMessageToPeers = (type,data) => {
    for (let id in peers){
        console.log('-----writeMessageToPeers start--------');
        console.log('type: ' + type + ',to: '+id);
        console.log('-----writeMessageToPeers end-----------');
        sendMessage(id, type, data);
    }
};
//writeMessageToPeerToId will be sending message to a specific peer ID
writeMessageToPeerToId = (toId, type, data) => {
    for (let id in peers) {
        if (id === toId) {
            console.log('----writeMessageToPeerToId start-----');
            console.log('type: '+ type + ', to: ' + toId);
            console.log('-----writeMessageToPeerToId end -------');
            sendMessage(id, type,data);
        }
    }
};
//Generic method to send a message formatted with params you would like to pass
sendMessage = (id, type, data) => {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: myPeerId,
            type: type,
            data: data
        }
    ));
};
// By using a MessageType property, we can define a switch mechanism so different messages types will be used for
// different functions.
let MessageType = {
    REQUEST_BLOCK : 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    RECEIVE_NEW_BLOCK: 'receiveNewBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',
    REGISTER_MINER: 'registerMiner',
    REQUEST_LATEST_BLOCK: 'requestLatestBlock',
    Latest_BLOCK: 'latestBlock'
};

//Once a connection data event message is received, you can create your switch
//code to handle the different types of requests
setTimeout(function(){
    writeMessageToPeers(MessageType.REQUEST_ALL_REGISTER_MINERS,null);    
}, 5000);

setTimeout(function(){
    registeredMiners.push(myPeerId.toString('hex'));
    console.log('---------Register my miner-------');
    console.log(registeredMiners);
    writeMessageToPeers(MessageType.REGISTER_MINER, registeredMiners);
    console.log('-----------Register my miner------------');
}, 7000);

// set a timeout request that wil send a request to retrieve the latest block every 5sec

setTimeout(function(){
    writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: chain.getLatestBlock().index+1});
},5000);




//async function continuously monitor swarm on event messages




    //unregister miner once a connection with the miner is closed or lost


            let lastBlockMinedBy = null;

            const job = new CronJob('30 * * * * *', function(){
                let index = 0;
                if (lastBlockMinedBy){
                        let newIndex = registeredMiners.indexOf(lastBlockMinedBy);
                        index = ( newIndex+1 > registeredMiners.length-1) ? 0 :
                        newIndex + 1;
                }
                lastBlockMinedBy = registeredMiners[index];
                console.log('--REQUESTING NEW BLOCK FROM : '+ registeredMiners[index] + ', index: ' + index);
                console.log(JSON.stringify(registeredMiners));
                if (registeredMiners[index] === myPeerId.toString('hex')){
                    console.log('---------create next block ----------');
                    let newBlock = chain.generateNextBlock(null);
                    chain.addBlock(newBlock);
                    chain.storeBlock(newBlock);
                    console.log(JSON.stringify(newBlock));
                    writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK,newBlock);
                    console.log(JSON.stringify(chain.blockchain));
                    console.log('------create next block----------');
                }
                    
                });
                job.start();