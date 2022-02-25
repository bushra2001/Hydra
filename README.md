# HYDRA:
Hydra is a very basic personalized P2P (Peer to Peer) blockchain network.

## How to Use:
```
git clone https://github.com/bushra2001/Hydra.git
npm install crypto discovery-swarm dat-swarm-defaults get-port
--save
```
To run the code from the clone library on GitHub, navigate to the code, follow
these Terminal commands to install the libraries, and run a node.js instance
attaching our p2p.js code:
```
cd [location]/Hydra
npm install
node p2p.js
```
## Tools:
It is implemented using;
- Nodejs
- Visual Studio Code

## Functionalities:
This network is capable of doing following:

- Send and receive messages and include blocks in these messages.
![peer1](https://raw.githubusercontent.com/bushra2001/Hydra/main/screenshots/peer1.jpeg)
![peer2](https://raw.githubusercontent.com/bushra2001/Hydra/main/screenshots/peer2.jpeg)
- Register and unregister miners using PoS consensus mechanism.
- Create new blocks and sent them between the peers.
- Store blocks using name-value LevelDB database. 
![Block and BlockHeader UML diagram](https://user-images.githubusercontent.com/61081924/155588613-2b0d5520-07dd-4292-b698-6db0e540cf3d.jpeg)

## Communication:
In this project, I have also created a wallet, that consists of private-public key pairs.
Hydra communicate via API services and the CLI.
