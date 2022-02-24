//impory statement for the open source libraries
//using const instead of let; to ensure there is no rebinding
const crypto = require('crypto'),
  Swarm = require('discovery-swarm'),
  defaults = require('dat-swarm-defaults'),
  getPort = require('get-port');

//Set variables to hold an object with the peers and connection sequence

const peers = {};
let connSeq = 0;

//Hydra is a channel name that all nodes connecting to
let channel = 'Hydra';

//set randomly generated peer ID for utilizing crypto library 
const myPeerId = crypto.randomBytes(32);
console.log('my PeerId: ' + myPeerId.toString('hex'));

//Generate config object that holds peerID
const config = defaults({
    id:myPeerId,
});

//Using config object to initialize swarm library
//Swarm library create a network swarm that uses discovery-channel to find and connect peers on a UCP/TCP network
const swarm = Swarm(config);

//async function continuously monitor swarm on event messages
(async () => {
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
            let message = JSON.parse(data);
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
})();
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

